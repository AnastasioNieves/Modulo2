# AprenTIC Campus API

API REST para la gestión académica multi-campus. Esta aplicación ofrece un backend completo con autenticación por roles, operaciones CRUD sobre las entidades del dominio, carga de ficheros, y varios endpoints de analítica para reporting.

Principales características:
- Implementación RESTful con Node.js y Express.
- Persistencia con MongoDB (Atlas o conexión local) y Mongoose.
- Autenticación y autorización basada en JWT y roles (`admin`, `profesor`, `alumno`).
- Subida de ficheros con `multer` (fotos, actas, etc.).
- Documentación automática con Swagger UI disponible en `/api-docs`.
- Suites de tests con Jest y Supertest; entornos de prueba aislados mediante `mongodb-memory-server`.

## Contenido del repositorio

- `src/` — código fuente del servidor (rutas, controladores, modelos, servicios, middlewares).
- `public/` — frontend de demostración (panel de administración y login).
- `scripts/` — utilidades de desarrollo: `seed.js` (poblar datos), `demo-server.js` (servidor con Mongo en memoria).
- `data/` — recursos de datos, p. ej. CSV para seeding.
- `diagrams/` — diagramas del modelo de datos.

## Tecnologías

- Node.js, Express
- MongoDB, Mongoose
- JSON Web Tokens (JWT)
- `bcryptjs` para hashing de contraseñas
- `express-validator` para validación de entrada
- `multer` para gestión de ficheros
- Swagger (swagger-jsdoc + swagger-ui-express)
- Jest, Supertest y `mongodb-memory-server` para pruebas

## Requisitos previos

- Node.js >= 18
- Acceso a MongoDB (Atlas o instancia local)

## Instalación y puesta en marcha

1. Instalar dependencias:

```bash
npm install
```

2. Crear el fichero de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

3. Ajustar las variables de entorno en `.env` (ver sección siguiente).

4. Poblar la base de datos (opcional, para demo):

```bash
npm run seed
```

5. Arrancar la aplicación en desarrollo:

```bash
npm run dev
```

En Windows PowerShell use `Copy-Item .env.example .env` si `cp` no está disponible.

Para ejecutar la demo con una base en memoria (no toca su Atlas ni Mongo local):

```bash
npm run demo
```

El comando `demo` arranca un servidor con `mongodb-memory-server` y siembra datos de ejemplo; útil para pruebas rápidas y presentaciones locales.

## Variables de entorno

Algunas variables de entorno relevantes (consulte `.env.example` para la lista completa):

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/aprentic-campus
MONGODB_DATABASE=aprentic-campus
JWT_SECRET=replace-me-in-production
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
```

Notas:
- `MONGODB_URI` puede apuntar a un clúster Atlas o a una instancia local. Si la cadena SRV falla en su entorno, la aplicación soporta una variante directa mediante `MONGODB_DIRECT_HOSTS`.
- `MONGODB_DATABASE` fuerza el nombre de base usado por Mongoose; por defecto es `aprentic-campus`.

## Usuarios de ejemplo (seed)

Tras ejecutar `npm run seed` se crean usuarios de prueba:

- Admin: `admin@aprentic.test` / `Admin1234!`
- Profesor: `ana.profesor@aprentic.test` / `Profesor1234!`
- Alumno: `lucia.alumna@aprentic.test` / `Alumno1234!`

## Endpoints destacados

La API expone múltiples recursos; los principales son:

- Frontend y autenticación
	- `GET /` — panel de demo (frontend)
	- `GET /login` — página de inicio de sesión
	- `POST /api/auth/register`
	- `POST /api/auth/login`

- Alumnos
	- `GET /api/alumnos` — listado y filtros
	- `POST /api/alumnos` — crear alumno
	- `PUT /api/alumnos/:id` — actualizar alumno
	- `POST /api/alumnos/:id/photo` — subir foto

- Promociones, Profesores, Proyectos, Notas
	- Rutas CRUD en `/api/promociones`, `/api/profesores`, `/api/proyectos`, `/api/notas`
	- `POST /api/notas/:id/acta` — subir acta/justificante

- Analíticas
	- `GET /api/analytics/tasa-aptos-campus`
	- `GET /api/analytics/alumnos-riesgo`
	- `GET /api/analytics/ranking-proyectos-no-aptos`

Consulte la documentación Swagger en `/api-docs` para la especificación completa y ejemplos de uso.

## Autenticación y roles

- `admin`: permisos totales sobre recursos y analíticas.
- `profesor`: puede gestionar notas de sus proyectos y consultar listas de alumnos/proyectos.
- `alumno`: acceso restringido a sus propios datos.

El middleware de autorización está implementado en `src/middlewares/requireRole.js` y `src/middlewares/authRequired.js`.

## Pruebas

Ejecutar la suite de tests:

```bash
npm test
```

Los tests de integración utilizan `mongodb-memory-server` para mantener el aislamiento respecto a entornos reales.

## Despliegue (ejemplo en Render / plataformas similares)

1. Provisionar un clúster MongoDB en Atlas (M0 está bien para pruebas).
2. Añadir variables de entorno en la plataforma (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, etc.).
3. Configurar build y start:

```text
Build command: npm install
Start command: npm start
```

4. Ejecutar el script de seed contra la base de Atlas si desea datos iniciales: `npm run seed`.

## Buenas prácticas y advertencias

- No ejecute `npm run demo` en entornos de producción: crea una base en memoria aislada (`test` por defecto) pensada únicamente para demos.
- Mantenga `JWT_SECRET` seguro y distinto entre entornos.
- Prefiera ejecutar el seed solo una vez o mediante jobs controlados para evitar duplicados.

## Estructura de datos y diagramas

Los diagramas de modelo se encuentran en `diagrams/` y proporcionan una representación conceptual y lógica del esquema usado.

## Contribuir

1. Abra un issue para discutir cambios importantes.
2. Cree ramas por feature/bugfix y envíe Pull Requests con pruebas cuando proceda.

---

Si necesita ayuda para conectar la aplicación a Atlas, ajustar variables de entorno o modificar el comportamiento del `demo-server`, abra un issue o solicítelo aquí y lo preparo.
