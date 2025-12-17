const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const configuracion = require('./configuracion');

function asegurarDirectorioDatos() {
  const directorio = path.dirname(configuracion.archivoBaseDatos);
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }
}

function migrarNombreArchivoBaseDatos() {
  if (process.env.DATABASE_FILE) {
    return;
  }
  const rutaNueva = configuracion.archivoBaseDatos;
  const directorioDatos = path.dirname(rutaNueva);
  const rutaAntigua = path.join(directorioDatos, 'simulador.sqlite');

  if (!fs.existsSync(rutaAntigua)) {
    return;
  }
  if (fs.existsSync(rutaNueva)) {
    return;
  }

  fs.renameSync(rutaAntigua, rutaNueva);
  const walAntiguo = `${rutaAntigua}-wal`;
  const shmAntiguo = `${rutaAntigua}-shm`;
  const walNuevo = `${rutaNueva}-wal`;
  const shmNuevo = `${rutaNueva}-shm`;
  if (fs.existsSync(walAntiguo) && !fs.existsSync(walNuevo)) {
    fs.renameSync(walAntiguo, walNuevo);
  }
  if (fs.existsSync(shmAntiguo) && !fs.existsSync(shmNuevo)) {
    fs.renameSync(shmAntiguo, shmNuevo);
  }
  console.log('[base-datos] Archivo de base de datos renombrado a base_datos.sqlite');
}

function obtenerMarcaTiempo() {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, '0');
  const d = String(ahora.getDate()).padStart(2, '0');
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mm = String(ahora.getMinutes()).padStart(2, '0');
  const ss = String(ahora.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}-${hh}${mm}${ss}`;
}

function existeTabla(baseDatos, nombre) {
  const fila = baseDatos
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(nombre);
  return Boolean(fila);
}

function requiereReinicioPorEsquema(baseDatos) {
  if (!existeTabla(baseDatos, 'simulaciones')) {
    return false;
  }
  if (existeTabla(baseDatos, 'usuarios')) {
    return false;
  }
  if (existeTabla(baseDatos, 'estudiantes')) {
    return true;
  }
  return true;
}

function respaldarYReiniciarArchivoBaseDatos() {
  const ruta = configuracion.archivoBaseDatos;
  if (!fs.existsSync(ruta)) {
    return;
  }
  const marca = obtenerMarcaTiempo();
  const respaldo = `${ruta}.backup-${marca}`;
  fs.renameSync(ruta, respaldo);
  const wal = `${ruta}-wal`;
  const shm = `${ruta}-shm`;
  if (fs.existsSync(wal)) {
    fs.renameSync(wal, `${wal}.backup-${marca}`);
  }
  if (fs.existsSync(shm)) {
    fs.renameSync(shm, `${shm}.backup-${marca}`);
  }
  console.log(`[base-datos] Base anterior respaldada en: ${path.basename(respaldo)}`);
}

function inicializarBaseDatos() {
  asegurarDirectorioDatos();
  migrarNombreArchivoBaseDatos();
  let baseDatos = new Database(configuracion.archivoBaseDatos);

  baseDatos.pragma('journal_mode = WAL');
  baseDatos.pragma('foreign_keys = ON');

  if (requiereReinicioPorEsquema(baseDatos)) {
    try {
      baseDatos.close();
    } catch (error) {
      baseDatos = null;
    }
    respaldarYReiniciarArchivoBaseDatos();
    baseDatos = new Database(configuracion.archivoBaseDatos);
    baseDatos.pragma('journal_mode = WAL');
    baseDatos.pragma('foreign_keys = ON');
  }

  const sentenciasDDL = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carreras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      catalogo TEXT,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usuarios_carreras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      carrera_id INTEGER NOT NULL,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(usuario_id, carrera_id),
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY(carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS malla_cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carrera_id INTEGER NOT NULL,
      codigo TEXT NOT NULL,
      asignatura TEXT NOT NULL,
      creditos REAL,
      nivel INTEGER,
      prereq TEXT,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(carrera_id, codigo),
      FOREIGN KEY(carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS simulaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      carrera_codigo TEXT NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT,
      contenido_json TEXT NOT NULL,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `;

  baseDatos.exec(sentenciasDDL);

  return baseDatos;
}

module.exports = {
  inicializarBaseDatos
};
