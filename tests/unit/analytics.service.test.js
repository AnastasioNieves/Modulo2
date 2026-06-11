jest.mock('../../src/models/Nota');

const Nota = require('../../src/models/Nota');
const analyticsService = require('../../src/services/analytics.service');

describe('analytics.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns tasa aptos por campus using aggregate', async () => {
    Nota.aggregate.mockResolvedValue([{ campusId: '1' }]);

    const result = await analyticsService.tasaAptosPorCampus();

    expect(Nota.aggregate).toHaveBeenCalledWith(expect.any(Array));
    expect(result).toEqual([{ campusId: '1' }]);
  });

  it('returns alumnos en riesgo with default params', async () => {
    Nota.aggregate.mockResolvedValue([{ alumnoId: '1' }]);

    const result = await analyticsService.alumnosEnRiesgo({});

    expect(Nota.aggregate).toHaveBeenCalledWith(expect.any(Array));
    expect(result).toEqual([{ alumnoId: '1' }]);
  });

  it('returns ranking proyectos no aptos with limit override', async () => {
    Nota.aggregate.mockResolvedValue([{ proyectoId: '1' }]);

    const result = await analyticsService.rankingProyectosNoAptos({ limit: 5 });

    expect(Nota.aggregate).toHaveBeenCalledWith(expect.any(Array));
    expect(result).toEqual([{ proyectoId: '1' }]);
  });
});
