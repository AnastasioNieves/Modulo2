const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Token JWT requerido');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub)
      .select('_id email role profesor alumno isActive')
      .lean();

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Usuario no autorizado');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      profesorId: user.profesor ? user.profesor.toString() : null,
      alumnoId: user.alumno ? user.alumno.toString() : null
    };

    return next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token JWT invalido o expirado'));
    }

    return next(err);
  }
}

module.exports = authRequired;
