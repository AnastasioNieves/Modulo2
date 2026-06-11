const ApiError = require('../utils/apiError');

module.exports = function requireFile(req, res, next) {
  if (!req.file) {
    return next(new ApiError(400, 'Archivo requerido'));
  }

  return next();
};
