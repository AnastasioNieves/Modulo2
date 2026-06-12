const alumnosService = require('../../src/services/alumnos.service');

describe('alumnos.service', () => {
  it('exports the crud service and setPhoto helper', () => {
    expect(typeof alumnosService).toBe('object');
    expect(typeof alumnosService.setPhoto).toBe('function');
  });

  it('buildFilter includes campus regex when provided', async () => {
    const options = alumnosService.__options;
    const filter = await options.buildFilter({ campus: 'madrid' });

    expect(filter.promocion).toBeTruthy();
  });

  it('buildFilter returns promo placeholder when mongoose is disconnected', async () => {
    const mongoose = require('mongoose');
    const options = alumnosService.__options;
    const originalReadyState = mongoose.connection.readyState;

    try {
      mongoose.connection.readyState = 0;
      const filter = await options.buildFilter({ campus: 'madrid' });
      expect(filter.promocion).toEqual({ $in: [] });
    } finally {
      mongoose.connection.readyState = originalReadyState;
    }
  });

  it('setPhoto updates alumno fotoUrl', async () => {
    const updateMock = jest.fn().mockResolvedValue({ _id: 'abc' });
    // replace exported update implementation
    alumnosService.update = updateMock;

    const result = await alumnosService.setPhoto('abc', { filename: 'photo.jpg' });
    expect(updateMock).toHaveBeenCalledWith('abc', { fotoUrl: '/uploads/photo.jpg' });
    expect(result).toEqual({ _id: 'abc' });
  });
});
