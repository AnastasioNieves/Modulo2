const mongoose = require('mongoose');
const env = require('./env');

async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri);
}

module.exports = connectDB;
