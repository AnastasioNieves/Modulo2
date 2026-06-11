const Nota = require('../models/Nota');
const Proyecto = require('../models/Proyecto');
const ApiError = require('../utils/apiError');
const { parsePagination } = require('../utils/pagination');

const populate = [
  { path: 'alumno', select: 'nombre apellidos email promocion' },
  { path: 'proyecto', select: 'nombre modulo promocion' },
  { path: 'profesor', select: 'nombre apellidos email' }
];

function canManageNota(user, nota) {
  if (user.role === 'admin') return true;
  const profesorId = nota.profesor && nota.profesor._id ? nota.profesor._id.toString() : nota.profesor.toString();
  return user.role === 'profesor' && user.profesorId && profesorId === user.profesorId;
}

function buildAccessFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'profesor' && user.profesorId) return { profesor: user.profesorId };
  if (user.role === 'alumno' && user.alumnoId) return { alumno: user.alumnoId };
  throw new ApiError(403, 'No tienes permisos para consultar notas');
}

async function ensureProfesorOwnsProyecto(proyectoId, profesorId) {
  const proyecto = await Proyecto.findOne({
    _id: proyectoId,
    profesor: profesorId,
    deletedAt: null
  }).select('_id');

  if (!proyecto) {
    throw new ApiError(403, 'Solo puedes gestionar notas de tus proyectos');
  }
}

async function list(query = {}, user) {
  const { page, limit, skip, sort } = parsePagination(query, [
    'createdAt',
    'updatedAt',
    'score',
    'apto'
  ]);
  const filter = {
    deletedAt: null,
    ...buildAccessFilter(user)
  };

  if (query.alumno) filter.alumno = query.alumno;
  if (query.proyecto) filter.proyecto = query.proyecto;
  if (query.profesor && user.role === 'admin') filter.profesor = query.profesor;
  if (typeof query.apto !== 'undefined') filter.apto = query.apto === 'true';

  const baseQuery = Nota.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  populate.forEach((item) => baseQuery.populate(item));

  const [items, total] = await Promise.all([
    baseQuery,
    Nota.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getById(id, user) {
  const query = Nota.findOne({ _id: id, deletedAt: null });
  populate.forEach((item) => query.populate(item));
  const nota = await query;

  if (!nota) {
    throw new ApiError(404, 'Nota no encontrada');
  }

  if (!canManageNota(user, nota) && user.role !== 'alumno') {
    throw new ApiError(403, 'No puedes acceder a esta nota');
  }

  const alumnoId = nota.alumno && nota.alumno._id ? nota.alumno._id.toString() : nota.alumno.toString();

  if (user.role === 'alumno' && alumnoId !== user.alumnoId) {
    throw new ApiError(403, 'No puedes acceder a esta nota');
  }

  return nota;
}

async function create(payload, user) {
  const data = { ...payload };

  if (user.role === 'profesor') {
    if (!user.profesorId) {
      throw new ApiError(403, 'Tu usuario no esta vinculado a un profesor');
    }
    await ensureProfesorOwnsProyecto(data.proyecto, user.profesorId);
    data.profesor = user.profesorId;
  }

  if (user.role !== 'admin' && user.role !== 'profesor') {
    throw new ApiError(403, 'No puedes crear notas');
  }

  const nota = await Nota.create(data);
  return getById(nota._id, user);
}

async function update(id, payload, user) {
  const current = await Nota.findOne({ _id: id, deletedAt: null });

  if (!current) {
    throw new ApiError(404, 'Nota no encontrada');
  }

  if (!canManageNota(user, current)) {
    throw new ApiError(403, 'Solo puedes modificar notas asignadas a ti');
  }

  const forbiddenForProfesor = ['profesor', 'alumno', 'proyecto'];
  const data = { ...payload };

  if (user.role === 'profesor') {
    forbiddenForProfesor.forEach((field) => delete data[field]);
  }

  if (typeof data.score === 'number' && typeof data.apto === 'undefined') {
    data.apto = data.score >= 60;
  }

  const updated = await Nota.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  return getById(updated._id, user);
}

async function attachActa(id, file, user) {
  return update(id, { actaUrl: `/uploads/${file.filename}` }, user);
}

async function softDelete(id) {
  const nota = await Nota.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!nota) {
    throw new ApiError(404, 'Nota no encontrada');
  }

  return nota;
}

module.exports = {
  list,
  getById,
  create,
  update,
  attachActa,
  softDelete
};
