const ApiError = require('../utils/apiError');

module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Autenticacion requerida'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'No tienes permisos para esta accion'));
    }

    return next();
  };
};
