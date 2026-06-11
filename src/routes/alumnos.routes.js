const express = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/alumnos.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');
const upload = require('../middlewares/upload');
const requireFile = require('../middlewares/requireFile');
const { mongoIdParam, paginationValidators } = require('../validators/common.validators');

const router = express.Router();

const listValidators = [
  ...paginationValidators,
  query('campus').optional().isMongoId(),
  query('promocion').optional().isMongoId(),
  query('estado').optional().isIn(['activo', 'riesgo', 'baja', 'egresado'])
];

const createValidators = [
  body('nombre').trim().notEmpty(),
  body('apellidos').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('telefono').optional().trim().isString(),
  body('promocion').isMongoId(),
  body('estado').optional().isIn(['activo', 'riesgo', 'baja', 'egresado'])
];

const updateValidators = [
  body('nombre').optional().trim().notEmpty(),
  body('apellidos').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('telefono').optional().trim().isString(),
  body('promocion').optional().isMongoId(),
  body('estado').optional().isIn(['activo', 'riesgo', 'baja', 'egresado'])
];

router.use(authRequired);

/**
 * @swagger
 * tags:
 *   - name: Alumnos
 *     description: CRUD de alumnos con filtros por campus, promocion y estado.
 */
router.get('/', requireRole('admin', 'profesor'), listValidators, validate, asyncHandler(controller.list));
router.get('/:id', requireRole('admin', 'profesor'), mongoIdParam(), validate, asyncHandler(controller.getById));
router.post('/', requireRole('admin'), createValidators, validate, asyncHandler(controller.create));
router.put('/:id', requireRole('admin'), mongoIdParam(), updateValidators, validate, asyncHandler(controller.update));
router.post(
  '/:id/photo',
  requireRole('admin'),
  mongoIdParam(),
  validate,
  upload.single('foto'),
  requireFile,
  asyncHandler(controller.uploadPhoto)
);
router.delete('/:id', requireRole('admin'), mongoIdParam(), validate, asyncHandler(controller.remove));

module.exports = router;
