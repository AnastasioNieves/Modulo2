const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middlewares/validate');
const authRequired = require('../middlewares/authRequired');

const router = express.Router();

const registerValidators = [
  body('email').isEmail().normalizeEmail().withMessage('email debe ser valido'),
  body('password').isLength({ min: 8 }).withMessage('password debe tener al menos 8 caracteres'),
  body('role').optional().isIn(['admin', 'profesor', 'alumno']),
  body('profesor').optional({ nullable: true }).isMongoId(),
  body('alumno').optional({ nullable: true }).isMongoId()
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('email debe ser valido'),
  body('password').notEmpty().withMessage('password es obligatorio')
];

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Registro, login y perfil autenticado.
 */
router.post('/register', registerValidators, validate, asyncHandler(controller.register));
router.post('/login', loginValidators, validate, asyncHandler(controller.login));
router.get('/me', authRequired, controller.me);

module.exports = router;
