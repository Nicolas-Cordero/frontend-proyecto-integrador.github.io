const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const directorioRaiz = path.resolve(__dirname, '..');
const directorioDatos = path.join(directorioRaiz, 'data');
const directorioSimulaciones = path.join(directorioDatos, 'simulaciones');

module.exports = {
  puerto: process.env.BACKEND_PORT || 4000,
  archivoBaseDatos: process.env.DATABASE_FILE || path.join(directorioDatos, 'simulador.sqlite'),
  origenCors: process.env.CORS_ORIGIN || '*',
  directorioSimulaciones
};
