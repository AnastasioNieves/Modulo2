const express = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/promociones.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');
const { mongoIdParam, paginationValidators } = require('../validators/common.validators');

const router = express.Router();

const listValidators = [
  ...paginationValidators,
  query('campus').optional().isMongoId(),
  query('modalidad').optional().isIn(['presencial', 'online', 'hibrida'])
];

const createValidators = [
  body('nombre').trim().notEmpty(),
  body('codigo').trim().notEmpty(),
  body('campus').isMongoId(),
  body('fechaInicio').optional().isISO8601().toDate(),
  body('fechaFin').optional().isISO8601().toDate(),
  body('modalidad').optional().isIn(['presencial', 'online', 'hibrida'])
];

const updateValidators = [
  body('nombre').optional().trim().notEmpty(),
  body('codigo').optional().trim().notEmpty(),
  body('campus').optional().isMongoId(),
  body('fechaInicio').optional().isISO8601().toDate(),
  body('fechaFin').optional().isISO8601().toDate(),
  body('modalidad').optional().isIn(['presencial', 'online', 'hibrida'])
];

router.use(authRequired);

/**
 * @swagger
 * tags:
 *   - name: Promociones
 *     description: Bootcamps/cohortes vinculadas a un campus.
 */
router.get('/', requireRole('admin', 'profesor'), listValidators, validate, asyncHandler(controller.list));
router.get('/:id', requireRole('admin', 'profesor'), mongoIdParam(), validate, asyncHandler(controller.getById));
router.post('/', requireRole('admin'), createValidators, validate, asyncHandler(controller.create));
router.put('/:id', requireRole('admin'), mongoIdParam(), updateValidators, validate, asyncHandler(controller.update));
router.delete('/:id', requireRole('admin'), mongoIdParam(), validate, asyncHandler(controller.remove));

module.exports = router;
