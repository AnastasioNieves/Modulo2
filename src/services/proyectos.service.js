const Proyecto = require('../models/Proyecto');
const createCrudService = require('./crudFactory');

module.exports = createCrudService(Proyecto, {
  populate: [
    { path: 'profesor', select: 'nombre apellidos email' },
    {
      path: 'promocion',
      select: 'nombre codigo campus',
      populate: { path: 'campus', select: 'nombre ciudad' }
    }
  ],
  searchFields: ['nombre', 'modulo', 'descripcion'],
  sortFields: ['createdAt', 'updatedAt', 'nombre', 'modulo', 'fechaEntrega'],
  buildFilter: async (query) => {
    const filter = {};
    if (query.promocion) filter.promocion = query.promocion;
    if (query.profesor) filter.profesor = query.profesor;
    if (query.modulo) filter.modulo = new RegExp(String(query.modulo), 'i');
    return filter;
  }
});
