const Nota = require('../models/Nota');

async function tasaAptosPorCampus() {
  return Nota.aggregate([
    { $match: { deletedAt: null } },
    {
      $lookup: {
        from: 'proyectos',
        localField: 'proyecto',
        foreignField: '_id',
        as: 'proyecto'
      }
    },
    { $unwind: '$proyecto' },
    {
      $lookup: {
        from: 'promociones',
        localField: 'proyecto.promocion',
        foreignField: '_id',
        as: 'promocion'
      }
    },
    { $unwind: '$promocion' },
    {
      $lookup: {
        from: 'campus',
        localField: 'promocion.campus',
        foreignField: '_id',
        as: 'campus'
      }
    },
    { $unwind: '$campus' },
    {
      $group: {
        _id: '$campus._id',
        campus: { $first: '$campus.nombre' },
        ciudad: { $first: '$campus.ciudad' },
        totalNotas: { $sum: 1 },
        totalAptos: { $sum: { $cond: ['$apto', 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        campusId: '$_id',
        campus: 1,
        ciudad: 1,
        totalNotas: 1,
        totalAptos: 1,
        tasaAptos: {
          $round: [{ $multiply: [{ $divide: ['$totalAptos', '$totalNotas'] }, 100] }, 2]
        }
      }
    },
    { $sort: { tasaAptos: -1, campus: 1 } }
  ]);
}

async function alumnosEnRiesgo({ threshold = 60, minNoAptos = 2 } = {}) {
  return Nota.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$alumno',
        media: { $avg: '$score' },
        totalNotas: { $sum: 1 },
        noAptos: { $sum: { $cond: ['$apto', 0, 1] } }
      }
    },
    {
      $match: {
        $or: [
          { media: { $lt: Number(threshold) } },
          { noAptos: { $gte: Number(minNoAptos) } }
        ]
      }
    },
    {
      $lookup: {
        from: 'alumnos',
        localField: '_id',
        foreignField: '_id',
        as: 'alumno'
      }
    },
    { $unwind: '$alumno' },
    {
      $lookup: {
        from: 'promociones',
        localField: 'alumno.promocion',
        foreignField: '_id',
        as: 'promocion'
      }
    },
    { $unwind: '$promocion' },
    {
      $lookup: {
        from: 'campus',
        localField: 'promocion.campus',
        foreignField: '_id',
        as: 'campus'
      }
    },
    { $unwind: '$campus' },
    {
      $project: {
        _id: 0,
        alumnoId: '$_id',
        nombre: '$alumno.nombre',
        apellidos: '$alumno.apellidos',
        email: '$alumno.email',
        promocion: '$promocion.codigo',
        campus: '$campus.nombre',
        media: { $round: ['$media', 2] },
        totalNotas: 1,
        noAptos: 1
      }
    },
    { $sort: { noAptos: -1, media: 1 } }
  ]);
}

async function rankingProyectosNoAptos({ limit = 10 } = {}) {
  return Nota.aggregate([
    { $match: { deletedAt: null, apto: false } },
    {
      $group: {
        _id: '$proyecto',
        noAptos: { $sum: 1 },
        mediaSuspensos: { $avg: '$score' }
      }
    },
    {
      $lookup: {
        from: 'proyectos',
        localField: '_id',
        foreignField: '_id',
        as: 'proyecto'
      }
    },
    { $unwind: '$proyecto' },
    {
      $lookup: {
        from: 'profesores',
        localField: 'proyecto.profesor',
        foreignField: '_id',
        as: 'profesor'
      }
    },
    { $unwind: '$profesor' },
    {
      $project: {
        _id: 0,
        proyectoId: '$_id',
        proyecto: '$proyecto.nombre',
        modulo: '$proyecto.modulo',
        profesor: {
          $concat: ['$profesor.nombre', ' ', '$profesor.apellidos']
        },
        noAptos: 1,
        mediaSuspensos: { $round: ['$mediaSuspensos', 2] }
      }
    },
    { $sort: { noAptos: -1, mediaSuspensos: 1 } },
    { $limit: Number(limit) || 10 }
  ]);
}

module.exports = {
  tasaAptosPorCampus,
  alumnosEnRiesgo,
  rankingProyectosNoAptos
};
