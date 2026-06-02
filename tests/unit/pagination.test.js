const { parsePagination } = require('../../src/utils/pagination');

describe('parsePagination', () => {
  it('normaliza pagina, limite y ordenacion permitida', () => {
    const result = parsePagination(
      { page: '2', limit: '5', sort: '-nombre' },
      ['createdAt', 'nombre']
    );

    expect(result).toEqual({
      page: 2,
      limit: 5,
      skip: 5,
      sort: { nombre: -1 }
    });
  });

  it('limita valores peligrosos y usa createdAt si el sort no esta permitido', () => {
    const result = parsePagination(
      { page: '-8', limit: '999', sort: '-passwordHash' },
      ['createdAt', 'nombre']
    );

    expect(result.page).toBe(1);
    expect(result.limit).toBe(100);
    expect(result.sort).toEqual({ createdAt: -1 });
  });
});
