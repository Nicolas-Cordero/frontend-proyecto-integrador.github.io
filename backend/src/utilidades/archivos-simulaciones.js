const fs = require('fs');
const path = require('path');
const configuracion = require('../configuracion');

function asegurarDirectorioSimulaciones() {
  if (!fs.existsSync(configuracion.directorioSimulaciones)) {
    fs.mkdirSync(configuracion.directorioSimulaciones, { recursive: true });
  }
}

function normalizarTipo(tipo) {
  if (!tipo) {
    return null;
  }
  return String(tipo).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function normalizarRut(rut) {
  if (!rut) {
    return null;
  }
  const limpio = String(rut).trim();
  return limpio.replace(/[^0-9kK]/g, '') || null;
}

function rutaArchivoSimulacion(id, rut = null, tipo = null) {
  const tipoNormalizado = normalizarTipo(tipo);
  const rutNormalizado = normalizarRut(rut);
  if (rutNormalizado && tipoNormalizado) {
    return path.join(configuracion.directorioSimulaciones, rutNormalizado, tipoNormalizado, `simulacion-${id}.json`);
  }
  if (tipoNormalizado) {
    return path.join(configuracion.directorioSimulaciones, `simulacion-${id}-${tipoNormalizado}.json`);
  }
  return path.join(configuracion.directorioSimulaciones, `simulacion${id}.json`);
}

function asegurarDirectorioParaArchivo(ruta) {
  const dir = path.dirname(ruta);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function guardarArchivoSimulacion(id, rut, contenido, tipo = null) {
  asegurarDirectorioSimulaciones();
  const ruta = rutaArchivoSimulacion(id, rut, tipo);
  asegurarDirectorioParaArchivo(ruta);
  const cuerpo = JSON.stringify(contenido, null, 2);
  fs.writeFileSync(ruta, cuerpo, 'utf8');
  return ruta;
}

function obtenerRutaArchivoSimulacion(id, rut, tipo = null) {
  const rutaNueva = rutaArchivoSimulacion(id, rut, tipo);
  if (fs.existsSync(rutaNueva)) {
    return rutaNueva;
  }

  const rutaTipada = rutaArchivoSimulacion(id, null, tipo);
  if (fs.existsSync(rutaTipada)) {
    return rutaTipada;
  }
  const rutaLegacy = rutaArchivoSimulacion(id, null, null);
  return fs.existsSync(rutaLegacy) ? rutaLegacy : null;
}

function eliminarArchivosEnDirectorio(directorio, predicado) {
  try {
    if (!fs.existsSync(directorio)) {
      return;
    }
    const entradas = fs.readdirSync(directorio, { withFileTypes: true });
    entradas.forEach((entrada) => {
      const ruta = path.join(directorio, entrada.name);
      if (entrada.isDirectory()) {
        eliminarArchivosEnDirectorio(ruta, predicado);
        return;
      }
      if (predicado(entrada.name)) {
        try {
          fs.unlinkSync(ruta);
        } catch (error) {
          return;
        }
      }
    });
  } catch (error) {
    return;
  }
}

function eliminarArchivoSimulacion(id, rut = null, tipo = null) {
  const rutaNueva = rutaArchivoSimulacion(id, rut, tipo);
  if (fs.existsSync(rutaNueva)) {
    try {
      fs.unlinkSync(rutaNueva);
    } catch (error) {
      return;
    }
  }

  const rutaTipada = rutaArchivoSimulacion(id, null, tipo);
  if (fs.existsSync(rutaTipada)) {
    try {
      fs.unlinkSync(rutaTipada);
    } catch (error) {
      return;
    }
  }

  const rutaLegacy = rutaArchivoSimulacion(id, null, null);
  if (fs.existsSync(rutaLegacy)) {
    try {
      fs.unlinkSync(rutaLegacy);
    } catch (error) {
      return;
    }
  }

  const prefijo = `simulacion-${id}-`;
  eliminarArchivosEnDirectorio(configuracion.directorioSimulaciones, (nombre) => nombre === `simulacion-${id}.json` || (nombre.startsWith(prefijo) && nombre.endsWith('.json')));
}

module.exports = {
  guardarArchivoSimulacion,
  obtenerRutaArchivoSimulacion,
  eliminarArchivoSimulacion,
  rutaArchivoSimulacion,
  normalizarTipo,
  normalizarRut
};
