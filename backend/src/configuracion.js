const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const directorioRaiz = path.resolve(__dirname, '..');
const directorioDatos = path.join(directorioRaiz, 'data');
const directorioSimulaciones = path.join(directorioDatos, 'simulaciones');
const archivoBaseDatosPorDefecto = path.join(directorioDatos, 'base_datos.sqlite');

module.exports = {
  puerto: process.env.BACKEND_PORT || 4000,
  archivoBaseDatos: process.env.DATABASE_FILE || archivoBaseDatosPorDefecto,
  origenCors: process.env.CORS_ORIGIN || '*',
  directorioSimulaciones,
  archivoBaseDatosPorDefecto
};
