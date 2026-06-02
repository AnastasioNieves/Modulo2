const express = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/campus.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');
const { mongoIdParam, paginationValidators } = require('../validators/common.validators');

const router = express.Router();

const listValidators = [
  ...paginationValidators,
  query('ciudad').optional().trim().isString()
];

const createValidators = [
  body('nombre').trim().notEmpty().withMessage('nombre es obligatorio'),
  body('ciudad').trim().notEmpty().withMessage('ciudad es obligatoria'),
  body('direccion').optional().trim().isString()
];

const updateValidators = [
  body('nombre').optional().trim().notEmpty(),
  body('ciudad').optional().trim().notEmpty(),
  body('direccion').optional().trim().isString()
];

router.use(authRequired);

/**
 * @swagger
 * tags:
 *   - name: Campus
 *     description: Sedes donde se imparten promociones.
 */
router.get('/', requireRole('admin', 'profesor'), listValidators, validate, asyncHandler(controller.list));
router.get('/:id', requireRole('admin', 'profesor'), mongoIdParam(), validate, asyncHandler(controller.getById));
router.post('/', requireRole('admin'), createValidators, validate, asyncHandler(controller.create));
router.put('/:id', requireRole('admin'), mongoIdParam(), updateValidators, validate, asyncHandler(controller.update));
router.delete('/:id', requireRole('admin'), mongoIdParam(), validate, asyncHandler(controller.remove));

module.exports = router;
