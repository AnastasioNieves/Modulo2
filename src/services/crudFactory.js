const ApiError = require('../utils/apiError');
const { parsePagination } = require('../utils/pagination');

function applyPopulate(query, populate = []) {
  populate.forEach((item) => {
    query.populate(item);
  });
  return query;
}

function createCrudService(Model, options = {}) {
  const {
    populate = [],
    searchFields = [],
    sortFields = ['createdAt', 'updatedAt'],
    buildFilter = async () => ({})
  } = options;

  async function list(query = {}) {
    const { page, limit, skip, sort } = parsePagination(query, sortFields);
    const filter = {
      deletedAt: null,
      ...(await buildFilter(query))
    };

    if (query.search && searchFields.length) {
      const regex = new RegExp(String(query.search).trim(), 'i');
      filter.$or = searchFields.map((field) => ({ [field]: regex }));
    }

    const findQuery = applyPopulate(Model.find(filter), populate)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const [items, total] = await Promise.all([
      findQuery,
      Model.countDocuments(filter)
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

  async function getById(id) {
    const query = Model.findOne({ _id: id, deletedAt: null });
    const item = await applyPopulate(query, populate);
    if (!item) {
      throw new ApiError(404, 'Recurso no encontrado');
    }
    return item;
  }

  async function create(payload) {
    const item = await Model.create(payload);
    return getById(item._id);
  }

  async function update(id, payload) {
    const item = await Model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new ApiError(404, 'Recurso no encontrado');
    }

    return getById(item._id);
  }

  async function softDelete(id) {
    const item = await Model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!item) {
      throw new ApiError(404, 'Recurso no encontrado');
    }

    return item;
  }

  return {
    list,
    getById,
    create,
    update,
    softDelete
  };
}

module.exports = createCrudService;
