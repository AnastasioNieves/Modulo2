const createCrudService = require('../../src/services/crudFactory');
const ApiError = require('../../src/utils/apiError');

const makeModelStub = () => {
  const query = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  };

  return {
    find: jest.fn().mockReturnValue(query),
    countDocuments: jest.fn().mockResolvedValue(1),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn()
  };
};

describe('crudFactory', () => {
  it('lists items with pagination and search filters', async () => {
    const Model = makeModelStub();
    const service = createCrudService(Model, { searchFields: ['name'], sortFields: ['name'] });

    const result = await service.list({ search: 'abc', page: '2', limit: '5', sort: 'name' });

    expect(Model.find).toHaveBeenCalled();
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(5);
    expect(result.items).toBeTruthy();
  });

  it('throws 404 when getById cannot find item', async () => {
    const Model = makeModelStub();
    Model.findOne.mockResolvedValue(null);
    const service = createCrudService(Model);

    await expect(service.getById('123')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('creates an item and returns populated result', async () => {
    const Model = makeModelStub();
    const item = { _id: '123' };
    Model.create.mockResolvedValue(item);
    Model.findOne.mockResolvedValue(item);
    const service = createCrudService(Model);

    const result = await service.create({ name: 'test' });

    expect(Model.create).toHaveBeenCalledWith({ name: 'test' });
    expect(Model.findOne).toHaveBeenCalledWith({ _id: '123', deletedAt: null });
    expect(result).toBe(item);
  });

  it('updates an existing item and returns it', async () => {
    const Model = makeModelStub();
    const item = { _id: '456' };
    Model.findOneAndUpdate.mockResolvedValue(item);
    Model.findOne.mockResolvedValue(item);
    const service = createCrudService(Model);

    const result = await service.update('456', { name: 'updated' });

    expect(Model.findOneAndUpdate).toHaveBeenCalledWith({ _id: '456', deletedAt: null }, { name: 'updated' }, { new: true, runValidators: true });
    expect(result).toBe(item);
  });

  it('throws 404 when update cannot find item', async () => {
    const Model = makeModelStub();
    Model.findOneAndUpdate.mockResolvedValue(null);
    const service = createCrudService(Model);

    await expect(service.update('123', {})).rejects.toMatchObject({ statusCode: 404 });
  });

  it('soft deletes an item', async () => {
    const Model = makeModelStub();
    const item = { _id: '789' };
    Model.findOneAndUpdate.mockResolvedValue(item);
    const service = createCrudService(Model);

    const result = await service.softDelete('789');

    expect(Model.findOneAndUpdate).toHaveBeenCalledWith({ _id: '789', deletedAt: null }, { deletedAt: expect.any(Date) }, { new: true });
    expect(result).toBe(item);
  });

  it('throws 404 when softDelete cannot find item', async () => {
    const Model = makeModelStub();
    Model.findOneAndUpdate.mockResolvedValue(null);
    const service = createCrudService(Model);

    await expect(service.softDelete('123')).rejects.toMatchObject({ statusCode: 404 });
  });
});
