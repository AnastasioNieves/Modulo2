const express = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/proyectos.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');
const { mongoIdParam, paginationValidators } = require('../validators/common.validators');

const router = express.Router();

const listValidators = [
  ...paginationValidators,
  query('promocion').optional().isMongoId(),
  query('profesor').optional().isMongoId(),
  query('modulo').optional().trim().isString()
];

const createValidators = [
  body('nombre').trim().notEmpty(),
  body('modulo').trim().notEmpty(),
  body('descripcion').optional().trim().isString(),
  body('promocion').isMongoId(),
  body('profesor').isMongoId(),
  body('fechaEntrega').optional().isISO8601().toDate()
];

const updateValidators = [
  body('nombre').optional().trim().notEmpty(),
  body('modulo').optional().trim().notEmpty(),
  body('descripcion').optional().trim().isString(),
  body('promocion').optional().isMongoId(),
  body('profesor').optional().isMongoId(),
  body('fechaEntrega').optional().isISO8601().toDate()
];

router.use(authRequired);

/**
 * @swagger
 * tags:
 *   - name: Proyectos
 *     description: Proyectos evaluables por promocion y profesor.
 */
router.get('/', requireRole('admin', 'profesor'), listValidators, validate, asyncHandler(controller.list));
router.get('/:id', requireRole('admin', 'profesor'), mongoIdParam(), validate, asyncHandler(controller.getById));
router.post('/', requireRole('admin'), createValidators, validate, asyncHandler(controller.create));
router.put('/:id', requireRole('admin'), mongoIdParam(), updateValidators, validate, asyncHandler(controller.update));
router.delete('/:id', requireRole('admin'), mongoIdParam(), validate, asyncHandler(controller.remove));

module.exports = router;
