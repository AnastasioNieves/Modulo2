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

function normalizeMongoUri(rawUri) {
  if (!rawUri || !rawUri.startsWith('mongodb+srv://')) {
    return rawUri;
  }

  const parsedUri = new URL(rawUri);
  const params = new URLSearchParams(parsedUri.search);

  if (!params.has('ssl') && !params.has('tls')) {
    params.set('ssl', 'true');
  }

  if (!params.has('authSource')) {
    params.set('authSource', 'admin');
  }

  if (process.env.MONGODB_REPLICA_SET && !params.has('replicaSet')) {
    params.set('replicaSet', process.env.MONGODB_REPLICA_SET);
  }

  if (!params.has('retryWrites')) {
    params.set('retryWrites', 'true');
  }

  if (!params.has('w')) {
    params.set('w', 'majority');
  }

  const database =
    parsedUri.pathname && parsedUri.pathname !== '/'
      ? parsedUri.pathname
      : `/${process.env.MONGODB_DATABASE || 'aprentic-campus'}`;

  parsedUri.pathname = database;
  parsedUri.search = params.toString();

  const directHosts = (process.env.MONGODB_DIRECT_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
    .join(',');

  if (!directHosts) {
    return parsedUri.toString();
  }

  const credentials = parsedUri.username
    ? `${parsedUri.username}${parsedUri.password ? `:${parsedUri.password}` : ''}@`
    : '';

  return `mongodb://${credentials}${directHosts}${database}?${params.toString()}`;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: normalizeMongoUri(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aprentic-campus'
  ),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: Number.isNaN(saltRounds) ? 10 : saltRounds,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')
};
