const express = require('express');
const { query } = require('express-validator');
const controller = require('../controllers/analytics.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.use(authRequired, requireRole('admin', 'profesor'));

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Agregaciones para reporting academico.
 */
router.get('/tasa-aptos-campus', asyncHandler(controller.tasaAptosPorCampus));
router.get(
  '/alumnos-riesgo',
  [
    query('threshold').optional().isFloat({ min: 0, max: 100 }).toFloat(),
    query('minNoAptos').optional().isInt({ min: 1 }).toInt()
  ],
  validate,
  asyncHandler(controller.alumnosEnRiesgo)
);
router.get(
  '/ranking-proyectos-no-aptos',
  [query('limit').optional().isInt({ min: 1, max: 100 }).toInt()],
  validate,
  asyncHandler(controller.rankingProyectosNoAptos)
);

module.exports = router;
