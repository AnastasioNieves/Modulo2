const authService = require('../services/auth.service');

async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};
