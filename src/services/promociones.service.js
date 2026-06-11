const Promocion = require('../models/Promocion');
const createCrudService = require('./crudFactory');

const promocionesOptions = {
  populate: [{ path: 'campus', select: 'nombre ciudad' }],
  searchFields: ['nombre', 'codigo'],
  sortFields: ['createdAt', 'updatedAt', 'nombre', 'codigo', 'fechaInicio'],
  buildFilter: async (query) => {
    const filter = {};
    if (query.campus) filter.campus = query.campus;
    if (query.modalidad) filter.modalidad = query.modalidad;
    return filter;
  }
};

module.exports = Object.assign(createCrudService(Promocion, promocionesOptions), { __options: promocionesOptions });
