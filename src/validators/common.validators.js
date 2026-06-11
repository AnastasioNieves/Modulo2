const { param, query } = require('express-validator');

const mongoIdParam = (field = 'id') => [
  param(field).isMongoId().withMessage(`${field} debe ser un ObjectId valido`)
];

const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
  query('sort').optional().isString().trim(),
  query('search').optional().isString().trim()
];

module.exports = {
  mongoIdParam,
  paginationValidators
};
