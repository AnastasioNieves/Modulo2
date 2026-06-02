const ApiError = require('../utils/apiError');

function normalizeError(err) {
  if (err instanceof ApiError) return err;

  if (err.name === 'CastError') {
    return new ApiError(400, 'Identificador invalido', { field: err.path });
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
    return new ApiError(400, 'Datos invalidos', details);
  }

  if (err.code === 11000) {
    return new ApiError(409, 'Ya existe un recurso con esos datos unicos', err.keyValue);
  }

  return new ApiError(500, 'Error interno del servidor');
}

function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);
  const payload = {
    message: normalized.message
  };

  if (normalized.details) {
    payload.details = normalized.details;
  }

  if (process.env.NODE_ENV !== 'production' && normalized.statusCode === 500) {
    payload.stack = err.stack;
  }

  res.status(normalized.statusCode).json(payload);
}

module.exports = errorHandler;
