const profesoresService = require('../../src/services/profesores.service');

describe('profesores.service', () => {
  it('configures the crud service with profesor filters and population', () => {
    const options = profesoresService.__options;
    expect(options.searchFields).toEqual(['nombre', 'apellidos', 'email', 'especialidad']);
    expect(options.populate).toEqual([
      { path: 'campus', select: 'nombre ciudad' },
      { path: 'promociones', select: 'nombre codigo' }
    ]);
    expect(typeof options.buildFilter).toBe('function');
  });

  it('buildFilter returns campus and promocion filters', async () => {
    const options = profesoresService.__options;
    const filter = await options.buildFilter({ campus: '1', promocion: '2' });
    expect(filter).toEqual({ campus: '1', promociones: '2' });
  });
});
