const service = require('../services/analytics.service');

async function tasaAptosPorCampus(req, res) {
  res.json({ data: await service.tasaAptosPorCampus() });
}

async function alumnosEnRiesgo(req, res) {
  res.json({
    data: await service.alumnosEnRiesgo({
      threshold: req.query.threshold,
      minNoAptos: req.query.minNoAptos
    })
  });
}

async function rankingProyectosNoAptos(req, res) {
  res.json({
    data: await service.rankingProyectosNoAptos({
      limit: req.query.limit
    })
  });
}

module.exports = {
  tasaAptosPorCampus,
  alumnosEnRiesgo,
  rankingProyectosNoAptos
};
