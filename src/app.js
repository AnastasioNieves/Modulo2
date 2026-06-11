const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/apiError');

const authRoutes = require('./routes/auth.routes');
const campusRoutes = require('./routes/campus.routes');
const alumnosRoutes = require('./routes/alumnos.routes');
const promocionesRoutes = require('./routes/promociones.routes');
const profesoresRoutes = require('./routes/profesores.routes');
const proyectosRoutes = require('./routes/proyectos.routes');
const notasRoutes = require('./routes/notas.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(process.cwd(), 'public')));
app.use('/uploads', express.static(env.uploadDir));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'aprentic-campus-api' });
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'public/login.html'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, 'Ruta no encontrada'));
});

app.use(errorHandler);

module.exports = app;
