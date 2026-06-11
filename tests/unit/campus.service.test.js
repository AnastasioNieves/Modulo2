const campusService = require('../../src/services/campus.service');

describe('campus.service', () => {
  it('exports the crud service and applies city filter', () => {
    const options = campusService.__options;
    expect(options.searchFields).toEqual(['nombre', 'ciudad']);
    expect(options.sortFields).toContain('nombre');
    expect(typeof options.buildFilter).toBe('function');
  });
});
