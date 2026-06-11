module.exports = jest.fn(() => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn()
}));
