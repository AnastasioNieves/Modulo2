process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-me';
process.env.PORT = process.env.PORT || 3000;

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const env = require('../src/config/env');
const Campus = require('../src/models/Campus');
const Promocion = require('../src/models/Promocion');
const Profesor = require('../src/models/Profesor');
const Alumno = require('../src/models/Alumno');
const Proyecto = require('../src/models/Proyecto');
const Nota = require('../src/models/Nota');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');

async function createUser(email, password, role, links = {}) {
  return User.create({
    email,
    passwordHash: await hashPassword(password),
    role,
    isActive: true,
    ...links
  });
}

async function seedDemoData() {
  const madrid = await Campus.create({ nombre: 'Madrid Centro', ciudad: 'Madrid' });
  const barcelona = await Campus.create({ nombre: 'Barcelona Tech', ciudad: 'Barcelona' });

  const fullstack = await Promocion.create({
    nombre: 'FullStack Enero 2026',
    codigo: 'FS-2026-01',
    campus: madrid._id,
    modalidad: 'presencial'
  });

  const dataScience = await Promocion.create({
    nombre: 'Data Science Febrero 2026',
    codigo: 'DS-2026-02',
    campus: barcelona._id,
    modalidad: 'hibrida'
  });

  const ana = await Profesor.create({
    nombre: 'Ana',
    apellidos: 'Ruiz',
    email: 'ana.profesor@aprentic.test',
    especialidad: 'Backend',
    campus: madrid._id,
    promociones: [fullstack._id]
  });

  const carlos = await Profesor.create({
    nombre: 'Carlos',
    apellidos: 'Vega',
    email: 'carlos.profesor@aprentic.test',
    especialidad: 'Data Science',
    campus: barcelona._id,
    promociones: [dataScience._id]
  });

  const lucia = await Alumno.create({
    nombre: 'Lucia',
    apellidos: 'Molina',
    email: 'lucia.alumna@aprentic.test',
    promocion: fullstack._id,
    estado: 'activo'
  });

  const marco = await Alumno.create({
    nombre: 'Marco',
    apellidos: 'Santos',
    email: 'marco.alumno@aprentic.test',
    promocion: fullstack._id,
    estado: 'riesgo'
  });

  const nuria = await Alumno.create({
    nombre: 'Nuria',
    apellidos: 'Lopez',
    email: 'nuria.alumna@aprentic.test',
    promocion: dataScience._id,
    estado: 'activo'
  });

  const diego = await Alumno.create({
    nombre: 'Diego',
    apellidos: 'Marti',
    email: 'diego.alumno@aprentic.test',
    promocion: dataScience._id,
    estado: 'riesgo'
  });

  const apiRest = await Proyecto.create({
    nombre: 'API REST academica',
    modulo: 'Modulo 2',
    descripcion: 'CRUD, auth, validacion y agregaciones',
    promocion: fullstack._id,
    profesor: ana._id
  });

  const dashboard = await Proyecto.create({
    nombre: 'Dashboard academico',
    modulo: 'Modulo 3',
    descripcion: 'Reporting academico con consultas agregadas',
    promocion: dataScience._id,
    profesor: carlos._id
  });

  await Nota.create([
    {
      alumno: lucia._id,
      proyecto: apiRest._id,
      profesor: ana._id,
      score: 86,
      feedback: 'Buen uso de capas MVC'
    },
    {
      alumno: marco._id,
      proyecto: apiRest._id,
      profesor: ana._id,
      score: 52,
      feedback: 'Necesita reforzar validaciones'
    },
    {
      alumno: nuria._id,
      proyecto: dashboard._id,
      profesor: carlos._id,
      score: 74,
      feedback: 'Agregaciones correctas'
    },
    {
      alumno: diego._id,
      proyecto: dashboard._id,
      profesor: carlos._id,
      score: 48,
      feedback: 'Faltan conclusiones y limpieza'
    }
  ]);

  await createUser('admin@aprentic.test', 'Admin1234!', 'admin');
  await createUser('ana.profesor@aprentic.test', 'Profesor1234!', 'profesor', { profesor: ana._id });
  await createUser('lucia.alumna@aprentic.test', 'Alumno1234!', 'alumno', { alumno: lucia._id });
}

async function main() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await seedDemoData();

  const server = app.listen(env.port, () => {
    console.log(`Demo AprenTIC lista en http://localhost:${env.port}`);
    console.log('Admin: admin@aprentic.test / Admin1234!');
    console.log('Profesor: ana.profesor@aprentic.test / Profesor1234!');
    console.log('Alumno: lucia.alumna@aprentic.test / Alumno1234!');
  });

  async function shutdown() {
    server.close(async () => {
      await mongoose.disconnect();
      await mongo.stop();
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
