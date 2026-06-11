const express = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/profesores.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');
const { mongoIdParam, paginationValidators } = require('../validators/common.validators');

const router = express.Router();

const listValidators = [
  ...paginationValidators,
  query('campus').optional().isMongoId(),
  query('promocion').optional().isMongoId()
];

const createValidators = [
  body('nombre').trim().notEmpty(),
  body('apellidos').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('especialidad').optional().trim().isString(),
  body('campus').isMongoId(),
  body('promociones').optional().isArray(),
  body('promociones.*').optional().isMongoId()
];

const updateValidators = [
  body('nombre').optional().trim().notEmpty(),
  body('apellidos').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('especialidad').optional().trim().isString(),
  body('campus').optional().isMongoId(),
  body('promociones').optional().isArray(),
  body('promociones.*').optional().isMongoId()
];

router.use(authRequired);

/**
 * @swagger
 * tags:
 *   - name: Profesores
 *     description: Profesores responsables de proyectos y notas.
 */
router.get('/', requireRole('admin', 'profesor'), listValidators, validate, asyncHandler(controller.list));
router.get('/:id', requireRole('admin', 'profesor'), mongoIdParam(), validate, asyncHandler(controller.getById));
router.post('/', requireRole('admin'), createValidators, validate, asyncHandler(controller.create));
router.put('/:id', requireRole('admin'), mongoIdParam(), updateValidators, validate, asyncHandler(controller.update));
router.delete('/:id', requireRole('admin'), mongoIdParam(), validate, asyncHandler(controller.remove));

module.exports = router;
