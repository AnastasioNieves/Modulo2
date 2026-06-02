const path = require('path');
require('dotenv').config();

const requiredInProduction = ['MONGODB_URI', 'JWT_SECRET'];

if (process.env.NODE_ENV === 'production') {
  requiredInProduction.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aprentic-campus',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: Number.isNaN(saltRounds) ? 10 : saltRounds,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')
};
