const promocionesService = require('../../src/services/promociones.service');

describe('promociones.service', () => {
  it('configures the crud service with campus and modalidad filters', () => {
    const options = promocionesService.__options;
    expect(options.searchFields).toEqual(['nombre', 'codigo']);
    expect(options.sortFields).toContain('codigo');
    expect(typeof options.buildFilter).toBe('function');
    expect(options.populate).toEqual([{ path: 'campus', select: 'nombre ciudad' }]);
  });

  it('buildFilter returns campus and modalidad filters', async () => {
    const options = promocionesService.__options;
    const filter = await options.buildFilter({ campus: 'campus1', modalidad: 'online' });
    expect(filter).toEqual({ campus: 'campus1', modalidad: 'online' });
  });
});
