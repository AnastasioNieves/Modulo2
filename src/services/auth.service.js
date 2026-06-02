const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { hashPassword, comparePassword } = require('../utils/password');

function signToken(user) {
  return jwt.sign(
    {
      role: user.role
    },
    env.jwtSecret,
    {
      subject: user._id.toString(),
      expiresIn: env.jwtExpiresIn
    }
  );
}

async function register(payload) {
  const requestedRole = payload.role || 'profesor';

  if (requestedRole === 'admin') {
    const adminExists = await User.exists({ role: 'admin' });
    if (adminExists) {
      throw new ApiError(403, 'El registro publico de admin solo esta permitido para el primer usuario');
    }
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await User.create({
    email: payload.email,
    passwordHash,
    role: requestedRole,
    profesor: payload.profesor || null,
    alumno: payload.alumno || null
  });

  return {
    user: sanitizeUser(user),
    token: signToken(user)
  };
}

async function login(email, password) {
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Credenciales invalidas');
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    throw new ApiError(401, 'Credenciales invalidas');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: sanitizeUser(user),
    token: signToken(user)
  };
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    profesor: user.profesor,
    alumno: user.alumno
  };
}

module.exports = {
  register,
  login,
  signToken,
  sanitizeUser
};
