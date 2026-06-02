# AprenTIC Campus API

API REST profesional para gestion academica multi-campus, construida con Node.js, Express, MongoDB Atlas y Mongoose. La base esta alineada con el PDF del proyecto integrador: MVC, JWT, roles, validacion, subida de archivos, agregaciones, Swagger, tests y seed desde CSV.

## Stack

- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT + bcryptjs (algoritmo bcrypt)
- express-validator
- Multer para fotos de alumnos y actas PDF
- Swagger UI en `/api-docs`
- Jest + supertest + mongodb-memory-server

## Modelo MongoDB Atlas recomendado

El proyecto usa MongoDB Atlas, una BBDD NoSQL documental. El modelo usa colecciones de documentos con referencias `ObjectId` porque el dominio tiene entidades que se consultan y modifican por separado:

- `Campus`: documentos de sedes fisicas/logicas.
- `Promocion`: documentos de cohortes, con `campus: ObjectId`.
- `Profesor`: documentos de docentes, con `campus: ObjectId` y `promociones: ObjectId[]`.
- `Alumno`: documentos de estudiantes, con `promocion: ObjectId`.
- `Proyecto`: documentos evaluables, con `promocion: ObjectId` y `profesor: ObjectId`.
- `Nota`: documentos de evaluacion con referencias a alumno, proyecto y profesor.
- `User`: documentos de autenticacion y rol (`admin`, `profesor`, `alumno`).

La relacion `Nota` tiene indice unico `{ alumno, proyecto }`, para evitar dos notas del mismo alumno en el mismo proyecto.

Diagramas de entrega:

- `diagrams/er-model.svg`: diagrama conceptual/documental MongoDB dibujado en SVG.
- `diagrams/logical-model.svg`: modelo logico MongoDB Atlas dibujado en SVG.

## Instalacion

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

En Windows PowerShell, copia `.env.example` a `.env` manualmente o con:

```powershell
Copy-Item .env.example .env
```

Para una demo local sin Atlas ni Mongo instalado:

```powershell
npm.cmd run demo
```

Abre `http://localhost:3000` y usa los botones de login rapido.

## Variables de entorno

```env
PORT=3000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/aprentic-campus
JWT_SECRET=cambia-este-secreto-en-produccion
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
```

## Usuarios demo del seed

- Admin: `admin@aprentic.test` / `Admin1234!`
- Profesor: `ana.profesor@aprentic.test` / `Profesor1234!`
- Alumno: `lucia.alumna@aprentic.test` / `Alumno1234!`

## Endpoints principales

- `GET /` panel web de demo
- `GET /login` pantalla de login del frontend
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/alumnos?campus=&promocion=&page=&sort=`
- `POST /api/alumnos/:id/photo`
- `GET /api/promociones`
- `GET /api/profesores`
- `GET /api/proyectos`
- `GET /api/notas`
- `POST /api/notas`
- `POST /api/notas/:id/acta`
- `GET /api/analytics/tasa-aptos-campus`
- `GET /api/analytics/alumnos-riesgo`
- `GET /api/analytics/ranking-proyectos-no-aptos`

## Roles

- `admin`: acceso total a CRUD, usuarios, notas y analiticas.
- `profesor`: lee alumnos, promociones, proyectos y solo crea/modifica notas de sus proyectos.
- `alumno`: extra preparado; puede consultar sus propias notas.

Por seguridad, el registro publico solo permite crear el primer `admin` de bootstrap. En una demo normal usa el seed y entra con `admin@aprentic.test`.

## Tests

```bash
npm test
```

Incluye tests unitarios de utilidades y tests de integracion con API real sobre MongoDB en memoria.

## Frontend de demo

La API sirve un frontend sencillo conectado al propio backend del proyecto:

- `/login`: pantalla propia de autenticacion que llama a `/api/auth/login`.
- `/`: panel protegido que usa el JWT guardado tras el login.
- Visualizar alumnos, proyectos y notas.
- Ver agregaciones: aptos por campus, alumnos en riesgo y ranking de no aptos.
- Actualizar notas desde el listado.
- Probar permisos con un intento controlado de borrado de alumno.

## Deploy en Render

1. Crea MongoDB Atlas M0 y copia el connection string.
2. Crea Web Service en Render conectado al repo GitHub.
3. Build command: `npm install`
4. Start command: `npm start`
5. Variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `BCRYPT_SALT_ROUNDS=10`.
6. Ejecuta el seed localmente contra Atlas o desde un job temporal de Render: `npm run seed`.

## Presentacion sugerida

1. Diagrama documental MongoDB Atlas y modelo logico.
2. Login admin en Postman.
3. CRUD de alumnos/promociones/profesores/proyectos.
4. Login profesor y prueba de permiso: no puede borrar alumnos.
5. Profesor crea o actualiza nota de un proyecto suyo.
6. Analiticas devolviendo datos reales.
7. Swagger UI funcionando.
8. `npm test` en verde.
