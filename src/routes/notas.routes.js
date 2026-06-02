const express = require('express');
const { body, query } = require('express-validator');
const controller = require('../controllers/notas.controller');
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
  query('alumno').optional().isMongoId(),
  query('proyecto').optional().isMongoId(),
  query('profesor').optional().isMongoId(),
  query('apto').optional().isBoolean()
];

const createValidators = [
  body('alumno').isMongoId(),
  body('proyecto').isMongoId(),
  body('profesor').optional().isMongoId(),
  body('score').isFloat({ min: 0, max: 100 }).toFloat(),
  body('apto').optional().isBoolean().toBoolean(),
  body('feedback').optional().trim().isString()
];

const updateValidators = [
  body('alumno').optional().isMongoId(),
  body('proyecto').optional().isMongoId(),
  body('profesor').optional().isMongoId(),
  body('score').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  body('apto').optional().isBoolean().toBoolean(),
  body('feedback').optional().trim().isString()
];

router.use(authRequired);

/**
 * @swagger
 * tags:
 *   - name: Notas
 *     description: Relacion evaluativa entre alumnos y proyectos.
 */
router.get('/', requireRole('admin', 'profesor', 'alumno'), listValidators, validate, asyncHandler(controller.list));
router.get('/:id', requireRole('admin', 'profesor', 'alumno'), mongoIdParam(), validate, asyncHandler(controller.getById));
router.post('/', requireRole('admin', 'profesor'), createValidators, validate, asyncHandler(controller.create));
router.put('/:id', requireRole('admin', 'profesor'), mongoIdParam(), updateValidators, validate, asyncHandler(controller.update));
router.post(
  '/:id/acta',
  requireRole('admin', 'profesor'),
  mongoIdParam(),
  validate,
  upload.single('acta'),
  requireFile,
  asyncHandler(controller.uploadActa)
);
router.delete('/:id', requireRole('admin'), mongoIdParam(), validate, asyncHandler(controller.remove));

module.exports = router;
