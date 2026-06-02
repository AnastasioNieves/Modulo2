const ApiError = require('../../src/utils/apiError');

describe('ApiError', () => {
  it('guarda statusCode, message y details', () => {
    const error = new ApiError(403, 'No permitido', [{ field: 'role' }]);

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('No permitido');
    expect(error.details).toEqual([{ field: 'role' }]);
  });
});
