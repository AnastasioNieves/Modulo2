const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { hashPassword } = require('../utils/password');

async function createAdmin(payload) {
  if (!payload.email || !payload.password) {
    throw new ApiError(400, 'Email y password son requeridos');
  }

  const emailLower = String(payload.email).toLowerCase();
  const exists = await User.exists({ email: emailLower });

  if (exists) {
    throw new ApiError(409, 'El email ya está registrado');
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await User.create({
    email: emailLower,
    passwordHash,
    role: 'admin',
    isActive: true
  });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    }
  };
}

module.exports = {
  createAdmin
};
