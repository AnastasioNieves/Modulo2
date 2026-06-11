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

describe('Complete integration coverage', () => {
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

  test('auth /me returns user profile', async () => {
    const token = await registerAndGetToken('me@aprentic.test', 'alumno');

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.user.email).toBe('me@aprentic.test');
    expect(res.body.user.role).toBe('alumno');
  });

  test('healthcheck and login flow', async () => {
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

  test('campus CRUD and role checks', async () => {
    const admin = await registerAndGetToken('campus-admin@aprentic.test', 'admin');
    const profesor = await registerAndGetToken('campus-prof@aprentic.test', 'profesor');

    // non-admin cannot create campus
    await request(app)
      .post('/api/campus')
      .set('Authorization', `Bearer ${profesor}`)
      .send({ nombre: 'Nope', ciudad: 'X' })
      .expect(403);

    // admin creates
    const create = await request(app)
      .post('/api/campus')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'Test Campus', ciudad: 'TestCity', direccion: 'Calle 1' })
      .expect(201);

    const id = create.body._id;

    const list = await request(app).get('/api/campus').set('Authorization', `Bearer ${admin}`).expect(200);
    expect(list.body.items.length).toBe(1);

    await request(app).get(`/api/campus/${id}`).set('Authorization', `Bearer ${admin}`).expect(200);

    await request(app)
      .put(`/api/campus/${id}`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'Updated Campus' })
      .expect(200);

    await request(app).delete(`/api/campus/${id}`).set('Authorization', `Bearer ${admin}`).expect(204);
  });

  test('promociones validation and CRUD', async () => {
    const admin = await registerAndGetToken('promo-admin@aprentic.test', 'admin');

    // validation: missing required fields
    await request(app).post('/api/promociones').set('Authorization', `Bearer ${admin}`).send({}).expect(400);

    const campus = await Campus.create({ nombre: 'C1', ciudad: 'City1' });
    const create = await request(app)
      .post('/api/promociones')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'PromoX', codigo: 'PX-1', campus: campus._id })
      .expect(201);

    const id = create.body._id;
    await request(app).get(`/api/promociones/${id}`).set('Authorization', `Bearer ${admin}`).expect(200);
    await request(app).put(`/api/promociones/${id}`).set('Authorization', `Bearer ${admin}`).send({ nombre: 'PX2' }).expect(200);
    await request(app).delete(`/api/promociones/${id}`).set('Authorization', `Bearer ${admin}`).expect(204);
  });

  test('profesores CRUD and role enforcement', async () => {
    const admin = await registerAndGetToken('prof-admin@aprentic.test', 'admin');
    const alumnoToken = await registerAndGetToken('not-prof@aprentic.test', 'alumno');

    const campus = await Campus.create({ nombre: 'C2', ciudad: 'City2' });

    // alumno cannot create profesor
    await request(app)
      .post('/api/profesores')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .send({ nombre: 'P', apellidos: 'Q', email: 'p@t.com', campus: campus._id })
      .expect(403);

    const create = await request(app)
      .post('/api/profesores')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'Ana', apellidos: 'L', email: 'ana@t.com', campus: campus._id })
      .expect(201);

    const id = create.body._id;
    await request(app).get(`/api/profesores/${id}`).set('Authorization', `Bearer ${admin}`).expect(200);
    await request(app).put(`/api/profesores/${id}`).set('Authorization', `Bearer ${admin}`).send({ nombre: 'Ana2' }).expect(200);
    await request(app).delete(`/api/profesores/${id}`).set('Authorization', `Bearer ${admin}`).expect(204);
  });

  test('proyectos CRUD and validation', async () => {
    const admin = await registerAndGetToken('proj-admin@aprentic.test', 'admin');
    const campus = await Campus.create({ nombre: 'C3', ciudad: 'X' });
    const promocion = await Promocion.create({ nombre: 'P1', codigo: 'P1', campus: campus._id });
    const profesor = await Profesor.create({ nombre: 'T', apellidos: 'T', email: 't@t.com', campus: campus._id, promociones: [promocion._id] });

    // missing required
    await request(app)
      .post('/api/proyectos')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'X' })
      .expect(400);

    const create = await request(app)
      .post('/api/proyectos')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'Project1', modulo: 'M1', promocion: promocion._id, profesor: profesor._id })
      .expect(201);

    const id = create.body._id;
    await request(app).get(`/api/proyectos/${id}`).set('Authorization', `Bearer ${admin}`).expect(200);
    await request(app).put(`/api/proyectos/${id}`).set('Authorization', `Bearer ${admin}`).send({ nombre: 'P2' }).expect(200);
    await request(app).delete(`/api/proyectos/${id}`).set('Authorization', `Bearer ${admin}`).expect(204);
  });

  test('alumnos full CRUD and validation/role behavior', async () => {
    const admin = await registerAndGetToken('al-admin@aprentic.test', 'admin');
    const profUser = await registerAndGetToken('al-prof@aprentic.test', 'profesor');

    const campus = await Campus.create({ nombre: 'C4', ciudad: 'City4' });
    const promocion = await Promocion.create({ nombre: 'Promo4', codigo: 'PR4', campus: campus._id });

    // validation: missing email
    await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'SinEmail', apellidos: 'X', promocion: promocion._id })
      .expect(400);

    const create = await request(app)
      .post('/api/alumnos')
      .set('Authorization', `Bearer ${admin}`)
      .send({ nombre: 'Paula', apellidos: 'M', email: 'paula@t.com', promocion: promocion._id })
      .expect(201);

    const id = create.body._id;
    await request(app).get(`/api/alumnos/${id}`).set('Authorization', `Bearer ${admin}`).expect(200);

    await request(app).put(`/api/alumnos/${id}`).set('Authorization', `Bearer ${admin}`).send({ telefono: '600111222' }).expect(200);

    // profesor cannot delete alumno
    const tokenProf = await registerAndGetToken('prof2@aprentic.test', 'profesor');
    await request(app).delete(`/api/alumnos/${id}`).set('Authorization', `Bearer ${tokenProf}`).expect(403);

    await request(app).delete(`/api/alumnos/${id}`).set('Authorization', `Bearer ${admin}`).expect(204);
  });

  test('notas endpoints and acta generation', async () => {
    const admin = await registerAndGetToken('n-admin@aprentic.test', 'admin');
    const campus = await Campus.create({ nombre: 'C5', ciudad: 'City5' });
    const promocion = await Promocion.create({ nombre: 'Promo5', codigo: 'PR5', campus: campus._id });
    const profesor = await Profesor.create({ nombre: 'Prof', apellidos: 'A', email: 'prof@t.com', campus: campus._id, promociones: [promocion._id] });
    const alumno = await Alumno.create({ nombre: 'Alumno', apellidos: 'A', email: 'al@t.com', promocion: promocion._id });
    const proyecto = await Proyecto.create({ nombre: 'Proj', modulo: 'M', promocion: promocion._id, profesor: profesor._id });

    const profToken = await registerAndGetToken('prof3@aprentic.test', 'profesor', { profesor: profesor._id });

    const note = await request(app)
      .post('/api/notas')
      .set('Authorization', `Bearer ${profToken}`)
      .send({ alumno: alumno._id, proyecto: proyecto._id, score: 85 })
      .expect(201);

    const nid = note.body._id;
    await request(app).get(`/api/notas/${nid}`).set('Authorization', `Bearer ${profToken}`).expect(200);

    // acta upload is a POST endpoint with file data
    await request(app)
      .post(`/api/notas/${nid}/acta`)
      .set('Authorization', `Bearer ${profToken}`)
      .attach('acta', Buffer.from('%PDF-1.4\n%Dummy PDF content'), 'acta.pdf')
      .expect(200);

    // admin can delete
    await request(app).delete(`/api/notas/${nid}`).set('Authorization', `Bearer ${admin}`).expect(204);
  });

  test('analytics endpoints respond', async () => {
    const adminToken = await registerAndGetToken('analytics-admin@aprentic.test', 'admin');
    const r = await request(app)
      .get('/api/analytics/tasa-aptos-campus')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(r.body.data)).toBe(true);
  });
});
