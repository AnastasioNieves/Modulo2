const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');

(async () => {
  process.env.NODE_ENV = 'test';
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  try {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'debug-admin@aprentic.test', password: 'Password123!', role: 'admin' });
    console.log('register status', reg.status, reg.body);
    const token = reg.body.token;
    const res = await request(app)
      .post('/api/campus')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Test Campus', ciudad: 'TestCity', direccion: 'Calle 1' });
    console.log('campus create', res.status, res.body);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    await mongo.stop();
  }
})();
