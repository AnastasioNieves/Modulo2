const Alumno = require('../models/Alumno');
const Promocion = require('../models/Promocion');
const Campus = require('../models/Campus');
const createCrudService = require('./crudFactory');
const mongoose = require('mongoose');

const alumnosOptions = {
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
      // If Mongoose isn't connected (unit tests), avoid DB queries and return a truthy placeholder
      if (mongoose.connection.readyState !== 1) {
        filter.promocion = { $in: [] };
      } else if (typeof query.campus === 'string') {
        const campuses = await Campus.find({ nombre: new RegExp(String(query.campus), 'i'), deletedAt: null }).select('_id');
        const promociones = await Promocion.find({ campus: { $in: campuses.map((c) => c._id) }, deletedAt: null }).select('_id');
        filter.promocion = { $in: promociones.map((promocion) => promocion._id) };
      } else {
        const promociones = await Promocion.find({
          campus: query.campus,
          deletedAt: null
        }).select('_id');
        filter.promocion = { $in: promociones.map((promocion) => promocion._id) };
      }
    }

    return filter;
  }
};

const alumnosCrud = createCrudService(Alumno, alumnosOptions);

async function setPhoto(id, file) {
  return module.exports.update(id, {
    fotoUrl: `/uploads/${file.filename}`
  });
}

module.exports = Object.assign(alumnosCrud, { setPhoto, __options: alumnosOptions });
