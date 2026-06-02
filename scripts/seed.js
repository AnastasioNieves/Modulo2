require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Campus = require('../src/models/Campus');
const Promocion = require('../src/models/Promocion');
const Profesor = require('../src/models/Profesor');
const Alumno = require('../src/models/Alumno');
const Proyecto = require('../src/models/Proyecto');
const Nota = require('../src/models/Nota');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');

const csvPath = path.resolve(process.cwd(), 'data/alumnos.csv');

async function upsertCampus(row) {
  return Campus.findOneAndUpdate(
    { nombre: row.campus_nombre },
    {
      nombre: row.campus_nombre,
      ciudad: row.campus_ciudad,
      deletedAt: null
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertPromocion(row, campus) {
  return Promocion.findOneAndUpdate(
    { codigo: row.promocion_codigo },
    {
      nombre: row.promocion_nombre,
      codigo: row.promocion_codigo,
      campus: campus._id,
      modalidad: 'presencial',
      deletedAt: null
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertProfesor(row, campus, promocion) {
  return Profesor.findOneAndUpdate(
    { email: row.profesor_email },
    {
      $set: {
        nombre: row.profesor_nombre,
        apellidos: row.profesor_apellidos,
        email: row.profesor_email,
        especialidad: row.especialidad,
        campus: campus._id,
        deletedAt: null
      },
      $addToSet: { promociones: promocion._id }
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertAlumno(row, promocion) {
  return Alumno.findOneAndUpdate(
    { email: row.alumno_email },
    {
      nombre: row.alumno_nombre,
      apellidos: row.alumno_apellidos,
      email: row.alumno_email,
      promocion: promocion._id,
      estado: Number(row.nota_score) < 60 ? 'riesgo' : 'activo',
      deletedAt: null
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertProyecto(row, promocion, profesor) {
  return Proyecto.findOneAndUpdate(
    {
      nombre: row.proyecto_nombre,
      promocion: promocion._id
    },
    {
      nombre: row.proyecto_nombre,
      modulo: row.proyecto_modulo,
      promocion: promocion._id,
      profesor: profesor._id,
      deletedAt: null
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function upsertNota(row, alumno, proyecto, profesor) {
  const score = Number(row.nota_score);
  return Nota.findOneAndUpdate(
    {
      alumno: alumno._id,
      proyecto: proyecto._id
    },
    {
      alumno: alumno._id,
      proyecto: proyecto._id,
      profesor: profesor._id,
      score,
      apto: score >= 60,
      feedback: row.nota_feedback,
      deletedAt: null
    },
    { upsert: true, new: true, runValidators: true }
  );
}

async function ensureDemoUsers(profesores, alumnos) {
  const adminPassword = await hashPassword('Admin1234!');
  await User.findOneAndUpdate(
    { email: 'admin@aprentic.test' },
    {
      email: 'admin@aprentic.test',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true
    },
    { upsert: true, new: true, runValidators: true }
  );

  for (const profesor of profesores) {
    const passwordHash = await hashPassword('Profesor1234!');
    await User.findOneAndUpdate(
      { email: profesor.email },
      {
        email: profesor.email,
        passwordHash,
        role: 'profesor',
        profesor: profesor._id,
        isActive: true
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  for (const alumno of alumnos) {
    const passwordHash = await hashPassword('Alumno1234!');
    await User.findOneAndUpdate(
      { email: alumno.email },
      {
        email: alumno.email,
        passwordHash,
        role: 'alumno',
        alumno: alumno._id,
        isActive: true
      },
      { upsert: true, new: true, runValidators: true }
    );
  }
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`No existe el CSV: ${csvPath}`);
  }

  await connectDB();

  const csv = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const profesores = new Map();
  const alumnos = new Map();

  for (const row of rows) {
    const campus = await upsertCampus(row);
    const promocion = await upsertPromocion(row, campus);
    const profesor = await upsertProfesor(row, campus, promocion);
    const alumno = await upsertAlumno(row, promocion);
    const proyecto = await upsertProyecto(row, promocion, profesor);
    await upsertNota(row, alumno, proyecto, profesor);

    profesores.set(profesor.email, profesor);
    alumnos.set(alumno.email, alumno);
  }

  await ensureDemoUsers([...profesores.values()], [...alumnos.values()]);

  console.log(`Seed completado: ${rows.length} filas procesadas.`);
  console.log('Admin demo: admin@aprentic.test / Admin1234!');
  console.log('Profesor demo: ana.profesor@aprentic.test / Profesor1234!');
  console.log('Alumno demo: lucia.alumna@aprentic.test / Alumno1234!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
