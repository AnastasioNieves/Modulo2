const userService = require('../services/users.service');

async function createAdmin(req, res) {
  const result = await userService.createAdmin(req.body);
  res.status(201).json(result);
}

module.exports = {
  createAdmin
};
