const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authRequired = require('../middlewares/authRequired');
const requireRole = require('../middlewares/requireRole');
const usersController = require('../controllers/users.controller');

const router = express.Router();

/**
 * @swagger
 * /api/users/admin:
 *   post:
 *     summary: Crear un nuevo administrador (solo admins)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Admin creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Email y password requeridos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tienes permisos (requiere rol admin)
 *       409:
 *         description: Email ya registrado
 */
router.post('/admin', authRequired, requireRole('admin'), asyncHandler(usersController.createAdmin));

module.exports = router;
