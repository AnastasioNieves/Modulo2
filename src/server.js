const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`AprenTIC Campus API escuchando en http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos', err);
    process.exit(1);
  });
