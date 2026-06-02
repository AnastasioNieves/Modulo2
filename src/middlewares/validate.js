const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

module.exports = function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((error) => ({
    field: error.path,
    message: error.msg
  }));

  return next(new ApiError(400, 'Validacion de inputs fallida', details));
};
