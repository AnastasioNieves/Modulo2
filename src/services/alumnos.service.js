const Alumno = require('../models/Alumno');
const Promocion = require('../models/Promocion');
const createCrudService = require('./crudFactory');

const alumnosCrud = createCrudService(Alumno, {
  populate: [
    {
      path: 'promocion',
      select: 'nombre codigo campus',
      populate: { path: 'campus', select: 'nombre ciudad' }
    }
  ],
  searchFields: ['nombre', 'apellidos', 'email'],
  sortFields: ['createdAt', 'updatedAt', 'nombre', 'apellidos', 'email', 'estado'],
  buildFilter: async (query) => {
    const filter = {};
    if (query.estado) filter.estado = query.estado;
    if (query.promocion) filter.promocion = query.promocion;

    if (query.campus) {
      const promociones = await Promocion.find({
        campus: query.campus,
        deletedAt: null
      }).select('_id');
      filter.promocion = { $in: promociones.map((promocion) => promocion._id) };
    }

    return filter;
  }
});

async function setPhoto(id, file) {
  return alumnosCrud.update(id, {
    fotoUrl: `/uploads/${file.filename}`
  });
}

module.exports = {
  ...alumnosCrud,
  setPhoto
};
