process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../src/app');
const Campus = require('../../src/models/Campus');
const Promocion = require('../../src/models/Promocion');
const Profesor = require('../../src/models/Profesor');
const Alumno = require('../../src/models/Alumno');
const Proyecto = require('../../src/models/Proyecto');

let mongo;

async function clearDatabase() {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({}))
  );
}

async function registerAndGetToken(email, role, extra = {}) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password: 'Password123!',
      role,
      ...extra
    })
    .expect(201);

  return response.body.token;
}

describe('AprenTIC Campus API', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('expone healthcheck y permite login con JWT', async () => {
    await request(app).get('/').expect(200).expect('Content-Type', /html/);
    const loginPage = await request(app).get('/login').expect(200).expect('Content-Type', /html/);
    expect(loginPage.text).toContain('method="post"');
    expect(loginPage.text).toContain('action="/api/auth/login"');
    expect(loginPage.text).toContain('name="email"');
    expect(loginPage.text).toContain('name="password"');
    await request(app).get('/health').expect(200);

    await registerAndGetToken('admin@aprentic.test', 'admin');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@aprentic.test', password: 'Password123!' })
      .expect(200);

    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.user.role).toBe('admin');

    const formLogin = await request(app)
      .post('/api/auth/login')
      .type('form')
      .send({ email: 'admin@aprentic.test', password: 'Password123!' })
      .expect(200)
      .expect('Content-Type', /html/);

    expect(formLogin.text).toContain('aprenticToken');
    expect(formLogin.text).toContain("window.location.replace('/')");
  });

  it('permite a admin crear campus, promocion y alumno filtrable por campus', async () => {
    const token = await registerAndGetToken('admin@aprentic.test', 'admin');

    const campus = await request(app)
      .post('/api/campus')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Madrid Centro', ciudad: 'Madrid' })
      .expect(201);

    const promocion = await request(app)
      .post('/api/promociones')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'FullStack Enero 2026',
        codigo: 'FS-2026-01',
        campus: campus.body._id
      })
      .expect(201);

    await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Lucia',
        apellidos: 'Molina',
        email: 'lucia@aprentic.test',
        promocion: promocion.body._id
      })
      .expect(201);

    const list = await request(app)
      .get(`/api/alumnos?campus=${campus.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].email).toBe('lucia@aprentic.test');
  });

  it('bloquea borrado de alumnos a profesor y le permite editar sus notas', async () => {
    const campus = await Campus.create({ nombre: 'Barcelona Tech', ciudad: 'Barcelona' });
    const promocion = await Promocion.create({
      nombre: 'Data Science Febrero 2026',
      codigo: 'DS-2026-02',
      campus: campus._id
    });
    const profesor = await Profesor.create({
      nombre: 'Carlos',
      apellidos: 'Vega',
      email: 'carlos@aprentic.test',
      campus: campus._id,
      promociones: [promocion._id]
    });
    const alumno = await Alumno.create({
      nombre: 'Nuria',
      apellidos: 'Lopez',
      email: 'nuria@aprentic.test',
      promocion: promocion._id
    });
    const proyecto = await Proyecto.create({
      nombre: 'Dashboard academico',
      modulo: 'Modulo 3',
      promocion: promocion._id,
      profesor: profesor._id
    });

    const token = await registerAndGetToken('carlos@aprentic.test', 'profesor', {
      profesor: profesor._id
    });

    await request(app)
      .delete(`/api/alumnos/${alumno._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    const nota = await request(app)
      .post('/api/notas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        alumno: alumno._id,
        proyecto: proyecto._id,
        score: 58,
        feedback: 'Necesita reforzar conclusiones'
      })
      .expect(201);

    expect(nota.body.apto).toBe(false);
    expect(nota.body.profesor._id).toBe(profesor._id.toString());

    const updated = await request(app)
      .put(`/api/notas/${nota.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 72 })
      .expect(200);

    expect(updated.body.score).toBe(72);
    expect(updated.body.apto).toBe(true);
  });
});
