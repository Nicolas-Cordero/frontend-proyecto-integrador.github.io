const fs = require('fs');
const path = require('path');
const configuracion = require('../configuracion');

function asegurarDirectorioSimulaciones() {
  if (!fs.existsSync(configuracion.directorioSimulaciones)) {
    fs.mkdirSync(configuracion.directorioSimulaciones, { recursive: true });
  }
}

function rutaArchivoSimulacion(id) {
  return path.join(configuracion.directorioSimulaciones, `simulacion${id}.json`);
}

function guardarArchivoSimulacion(id, contenido) {
  asegurarDirectorioSimulaciones();
  const ruta = rutaArchivoSimulacion(id);
  const cuerpo = JSON.stringify(contenido, null, 2);
  fs.writeFileSync(ruta, cuerpo, 'utf8');
  return ruta;
}

function obtenerRutaArchivoSimulacion(id) {
  const ruta = rutaArchivoSimulacion(id);
  return fs.existsSync(ruta) ? ruta : null;
}

function eliminarArchivoSimulacion(id) {
  const ruta = rutaArchivoSimulacion(id);
  if (fs.existsSync(ruta)) {
    fs.unlinkSync(ruta);
  }
}

module.exports = {
  guardarArchivoSimulacion,
  obtenerRutaArchivoSimulacion,
  eliminarArchivoSimulacion,
  rutaArchivoSimulacion
};
