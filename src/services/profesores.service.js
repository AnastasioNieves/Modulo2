const Profesor = require('../models/Profesor');
const createCrudService = require('./crudFactory');

module.exports = createCrudService(Profesor, {
  populate: [
    { path: 'campus', select: 'nombre ciudad' },
    { path: 'promociones', select: 'nombre codigo' }
  ],
  searchFields: ['nombre', 'apellidos', 'email', 'especialidad'],
  sortFields: ['createdAt', 'updatedAt', 'nombre', 'apellidos', 'email'],
  buildFilter: async (query) => {
    const filter = {};
    if (query.campus) filter.campus = query.campus;
    if (query.promocion) filter.promociones = query.promocion;
    return filter;
  }
});
