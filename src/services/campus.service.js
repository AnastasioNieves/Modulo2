const Campus = require('../models/Campus');
const createCrudService = require('./crudFactory');

module.exports = createCrudService(Campus, {
  searchFields: ['nombre', 'ciudad'],
  sortFields: ['createdAt', 'updatedAt', 'nombre', 'ciudad'],
  buildFilter: async (query) => {
    const filter = {};
    if (query.ciudad) filter.ciudad = new RegExp(String(query.ciudad), 'i');
    return filter;
  }
});
