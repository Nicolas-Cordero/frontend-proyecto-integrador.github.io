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

function asegurarColumna(baseDatos, tabla, columna, definicion) {
  try {
    const columnas = baseDatos.prepare(`PRAGMA table_info(${tabla})`).all();
    const existe = columnas.some((col) => col.name === columna);
    if (!existe) {
      baseDatos.prepare(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`).run();
      console.log(`[base-datos] Columna agregada: ${tabla}.${columna}`);
    }
  } catch (error) {
    console.warn(`[base-datos] No se pudo agregar columna ${tabla}.${columna}:`, error.message);
  }
}

function inicializarBaseDatos() {
  asegurarDirectorioDatos();
  const baseDatos = new Database(configuracion.archivoBaseDatos);

  baseDatos.pragma('journal_mode = WAL');
  baseDatos.pragma('foreign_keys = ON');

  const sentenciasDDL = `
    CREATE TABLE IF NOT EXISTS estudiantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT UNIQUE,
      correo TEXT,
      nombre TEXT,
      apellido TEXT,
      nombre_completo TEXT,
      foto_perfil TEXT,
      rol TEXT DEFAULT 'estudiante',
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carreras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identificador_externo TEXT,
      nombre TEXT NOT NULL,
      codigo_catalogo TEXT,
      campus TEXT,
      jornada TEXT,
      titulo_grado TEXT,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(identificador_externo, codigo_catalogo)
    );

    CREATE TABLE IF NOT EXISTS estudiantes_carreras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estudiante_id INTEGER NOT NULL,
      carrera_id INTEGER NOT NULL,
      generacion INTEGER,
      semestre_actual INTEGER,
      total_semestres INTEGER,
      promedio REAL,
      ramos_aprobados INTEGER,
      ramos_cursando INTEGER,
      estado TEXT,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(estudiante_id, carrera_id),
      FOREIGN KEY(estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
      FOREIGN KEY(carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ramos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carrera_id INTEGER NOT NULL,
      codigo TEXT,
      nombre TEXT NOT NULL,
      nivel INTEGER,
      creditos REAL,
      horas INTEGER,
      categoria TEXT,
      datos_crudos TEXT,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(carrera_id, codigo),
      FOREIGN KEY(carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS simulaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estudiante_id INTEGER NOT NULL,
      carrera_id INTEGER NOT NULL,
      titulo TEXT,
      periodo_objetivo TEXT,
      creditos_totales INTEGER,
      notas TEXT,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
      FOREIGN KEY(carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS simulaciones_ramos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      simulacion_id INTEGER NOT NULL,
      ramo_id INTEGER,
      codigo TEXT,
      nombre TEXT NOT NULL,
      nivel INTEGER,
      creditos REAL,
      estado TEXT,
      prioridad INTEGER,
      nota_esperada REAL,
      foto_ramo TEXT,
      FOREIGN KEY(simulacion_id) REFERENCES simulaciones(id) ON DELETE CASCADE,
      FOREIGN KEY(ramo_id) REFERENCES ramos(id) ON DELETE SET NULL
    );
  `;

  baseDatos.exec(sentenciasDDL);

  // Migraciones ligeras para instalaciones previas
  asegurarColumna(baseDatos, 'estudiantes', 'correo', 'TEXT');
  asegurarColumna(baseDatos, 'estudiantes', 'nombre', 'TEXT');
  asegurarColumna(baseDatos, 'estudiantes', 'apellido', 'TEXT');
  asegurarColumna(baseDatos, 'estudiantes', 'nombre_completo', 'TEXT');
  asegurarColumna(baseDatos, 'estudiantes', 'foto_perfil', 'TEXT');
  asegurarColumna(baseDatos, 'estudiantes', 'rol', "TEXT DEFAULT 'estudiante'");
  asegurarColumna(baseDatos, 'estudiantes', 'creado_en', 'TEXT DEFAULT CURRENT_TIMESTAMP');
  asegurarColumna(baseDatos, 'estudiantes', 'actualizado_en', 'TEXT DEFAULT CURRENT_TIMESTAMP');

  // Migrar columnas de carreras
  asegurarColumna(baseDatos, 'carreras', 'identificador_externo', 'TEXT');
  asegurarColumna(baseDatos, 'carreras', 'codigo_catalogo', 'TEXT');
  asegurarColumna(baseDatos, 'carreras', 'campus', 'TEXT');
  asegurarColumna(baseDatos, 'carreras', 'jornada', 'TEXT');
  asegurarColumna(baseDatos, 'carreras', 'titulo_grado', 'TEXT');
  asegurarColumna(baseDatos, 'carreras', 'creado_en', 'TEXT DEFAULT CURRENT_TIMESTAMP');
  asegurarColumna(baseDatos, 'carreras', 'actualizado_en', 'TEXT DEFAULT CURRENT_TIMESTAMP');

  // Migrar columnas de estudiantes_carreras
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'generacion', 'INTEGER');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'semestre_actual', 'INTEGER');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'total_semestres', 'INTEGER');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'promedio', 'REAL');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'ramos_aprobados', 'INTEGER');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'ramos_cursando', 'INTEGER');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'estado', 'TEXT');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'creado_en', 'TEXT DEFAULT CURRENT_TIMESTAMP');
  asegurarColumna(baseDatos, 'estudiantes_carreras', 'actualizado_en', 'TEXT DEFAULT CURRENT_TIMESTAMP');

  return baseDatos;
}

module.exports = {
  inicializarBaseDatos
};
