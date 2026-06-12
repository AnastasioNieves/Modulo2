const proyectosService = require('../../src/services/proyectos.service');

describe('proyectos.service', () => {
  it('configures the crud service with project search, sort, and populate rules', () => {
    const options = proyectosService.__options;
    expect(options.searchFields).toEqual(['nombre', 'modulo', 'descripcion']);
    expect(options.sortFields).toContain('fechaEntrega');
    expect(options.populate).toEqual([
      { path: 'profesor', select: 'nombre apellidos email' },
      {
        path: 'promocion',
        select: 'nombre codigo campus',
        populate: { path: 'campus', select: 'nombre ciudad' }
      }
    ]);
    expect(typeof options.buildFilter).toBe('function');
  });

  it('buildFilter returns filtros para promocion, profesor y modulo', async () => {
    const options = proyectosService.__options;
    const filter = await options.buildFilter({ promocion: 'p1', profesor: 'prof1', modulo: 'web' });

    expect(filter.promocion).toBe('p1');
    expect(filter.profesor).toBe('prof1');
    expect(filter.modulo).toEqual(expect.any(RegExp));
    expect(filter.modulo.test('Web')).toBe(true);
  });
});
