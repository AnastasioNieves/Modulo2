const Campus = require('../models/Campus');
const createCrudService = require('./crudFactory');

const campusOptions = {
  searchFields: ['nombre', 'ciudad'],
  sortFields: ['createdAt', 'updatedAt', 'nombre'],
  buildFilter: async (query) => {
    const filter = {};
    if (query.ciudad) filter.ciudad = query.ciudad;
    return filter;
  }
};

module.exports = Object.assign(createCrudService(Campus, campusOptions), { __options: campusOptions });
