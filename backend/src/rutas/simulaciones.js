const express = require('express');

const {
  guardarArchivoSimulacion,
  obtenerRutaArchivoSimulacion,
  eliminarArchivoSimulacion,
  normalizarTipo
} = require('../utilidades/archivos-simulaciones');

const enrutador = express.Router();

function esRutValido(rut) {
  if (!rut) return false;
  const limpio = String(rut).trim();
  if (limpio.length < 7 || limpio.length > 12) return false;
  return /^[0-9kK]+$/.test(limpio);
}

function esTipoValido(tipo) {
  return tipo === 'simulacion_siguiente_semestre' || tipo === 'simulacion_egreso';
}

function normalizarFechaIso(valor) {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function resolverIdUsuario(baseDatos, datos) {
  const id = Number(datos?.usuarioId ?? datos?.estudianteId ?? datos?.studentId);
  if (Number.isInteger(id) && id > 0) {
    return id;
  }
  const rut = datos?.rut || datos?.studentRut || datos?.rutEstudiante || null;
  if (!rut) {
    return null;
  }
  const fila = baseDatos.prepare('SELECT id FROM usuarios WHERE rut = ?').get(rut);
  return fila?.id || null;
}

function asegurarUsuario(baseDatos, rut, email) {
  if (!rut) {
    throw new Error('Debe indicar el rut del estudiante autenticado.');
  }
  if (!email) {
    throw new Error('Debe indicar el email del estudiante autenticado.');
  }
  const marcaTiempo = new Date().toISOString();
  const existente = baseDatos.prepare('SELECT id FROM usuarios WHERE rut = ?').get(rut);
  if (existente) {
    baseDatos.prepare('UPDATE usuarios SET email = ?, actualizado_en = ? WHERE id = ?').run(email, marcaTiempo, existente.id);
    return existente.id;
  }
  const insercion = baseDatos
    .prepare('INSERT INTO usuarios (rut, email, creado_en, actualizado_en) VALUES (?, ?, ?, ?)')
    .run(rut, email, marcaTiempo, marcaTiempo);
  return insercion.lastInsertRowid;
}

function asegurarCarrera(baseDatos, carrera) {
  const codigo = String(carrera?.codigo || carrera?.code || carrera?.id || '').trim();
  if (!codigo) {
    return null;
  }
  const nombre = String(carrera?.nombre || carrera?.name || '').trim() || `Carrera ${codigo}`;
  const catalogo = carrera?.catalogo || carrera?.catalog || carrera?.catalog_code || null;
  const marcaTiempo = new Date().toISOString();
  const existente = baseDatos.prepare('SELECT id FROM carreras WHERE codigo = ?').get(codigo);
  if (existente) {
    baseDatos.prepare('UPDATE carreras SET nombre = ?, catalogo = ?, actualizado_en = ? WHERE id = ?').run(nombre, catalogo, marcaTiempo, existente.id);
    return existente.id;
  }
  const insercion = baseDatos
    .prepare('INSERT INTO carreras (codigo, nombre, catalogo, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?)')
    .run(codigo, nombre, catalogo, marcaTiempo, marcaTiempo);
  return insercion.lastInsertRowid;
}

function extraerCarreraCodigo(carrera, carga) {
  const codigo = String(carrera?.codigo || carrera?.code || carrera?.id || carga?.codcarrera || carga?.carreraCodigo || '').trim();
  return codigo || null;
}

function normalizarCurso(curso) {
  if (!curso) {
    return null;
  }
  const codigo = curso.codigo || curso.code || null;
  const nombre = curso.asignatura || curso.nombre || curso.name || null;
  if (!nombre) {
    return null;
  }
  return {
    codigo,
    nombre,
    nivel: Number(curso.nivel || curso.level) || null,
    creditos: Number(curso.creditos || curso.credits) || null
  };
}

function seleccionarCursosAleatorios(cursos, cantidad) {
  const normalizados = Array.isArray(cursos) ? cursos.map(normalizarCurso).filter(Boolean) : [];
  const copia = [...normalizados];
  const seleccion = [];
  while (seleccion.length < cantidad && copia.length) {
    const indice = Math.floor(Math.random() * copia.length);
    seleccion.push(copia.splice(indice, 1)[0]);
  }
  while (seleccion.length < cantidad) {
    const i = seleccion.length + 1;
    seleccion.push({ codigo: `SIM${i}`, nombre: `Ramo simulado ${i}`, nivel: i, creditos: 5 });
  }
  return seleccion;
}

function insertarSimulacion(baseDatos, datos) {
  const marcaTiempo = new Date().toISOString();
  const insercion = baseDatos.prepare(`
    INSERT INTO simulaciones (usuario_id, carrera_codigo, tipo, titulo, contenido_json, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    datos.usuarioId,
    datos.carreraCodigo,
    datos.tipo,
    datos.titulo || null,
    JSON.stringify(datos.contenidoJson),
    marcaTiempo,
    marcaTiempo
  );
  return insercion.lastInsertRowid;
}

function obtenerFilaSimulacionConUsuario(baseDatos, id) {
  return baseDatos
    .prepare(
      `SELECT s.*, u.rut AS rut_usuario
         FROM simulaciones s
         JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.id = ?`
    )
    .get(Number(id));
}

function compararJson(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (error) {
    return false;
  }
}

function leerJsonArchivo(ruta) {
  try {
    const crudo = require('fs').readFileSync(ruta, 'utf8');
    return JSON.parse(crudo);
  } catch (error) {
    return null;
  }
}

function reconciliarSimulacion(baseDatos, fila) {
  if (!fila) return null;
  const rut = fila.rut_usuario;
  const tipo = normalizarTipo(fila.tipo) || null;
  if (!rut || !tipo) return fila;

  let jsonBd = null;
  try {
    jsonBd = JSON.parse(fila.contenido_json);
  } catch (error) {
    jsonBd = null;
  }
  if (!jsonBd) {
    jsonBd = { tipo: fila.tipo, simulacionId: fila.id };
  }

  const ruta = obtenerRutaArchivoSimulacion(fila.id, rut, tipo);
  const fs = require('fs');
  const existeArchivo = Boolean(ruta && fs.existsSync(ruta));
  const fechaBd = normalizarFechaIso(fila.actualizado_en) || normalizarFechaIso(fila.creado_en) || new Date(0);
  const fechaArchivo = existeArchivo ? fs.statSync(ruta).mtime : new Date(0);

  if (!existeArchivo) {
    try {
      guardarArchivoSimulacion(fila.id, rut, jsonBd, tipo);
    } catch (error) {
      return fila;
    }
    return fila;
  }

  const jsonArchivo = leerJsonArchivo(ruta);
  if (!jsonArchivo) {
    try {
      guardarArchivoSimulacion(fila.id, rut, jsonBd, tipo);
    } catch (error) {
      return fila;
    }
    return fila;
  }

  if (compararJson(jsonBd, jsonArchivo)) {
    return fila;
  }

  if (fechaArchivo > fechaBd) {
    try {
      baseDatos
        .prepare('UPDATE simulaciones SET contenido_json = ?, actualizado_en = ? WHERE id = ?')
        .run(JSON.stringify(jsonArchivo), new Date().toISOString(), fila.id);
    } catch (error) {
      return fila;
    }
    return fila;
  }

  try {
    guardarArchivoSimulacion(fila.id, rut, jsonBd, tipo);
  } catch (error) {
    return fila;
  }
  return fila;
}

function leerSimulacion(baseDatos, id) {
  let fila = obtenerFilaSimulacionConUsuario(baseDatos, id);
  if (!fila) {
    return null;
  }
  fila = reconciliarSimulacion(baseDatos, fila) || fila;
  let contenido = null;
  try {
    contenido = JSON.parse(fila.contenido_json);
  } catch (error) {
    contenido = { tipo: fila.tipo, simulacionId: fila.id };
  }

  const tipo = normalizarTipo(fila.tipo) || null;
  let rutaFinal = obtenerRutaArchivoSimulacion(fila.id, fila.rut_usuario, tipo);
  if (!rutaFinal) {
    try {
      rutaFinal = guardarArchivoSimulacion(fila.id, fila.rut_usuario, contenido, tipo);
    } catch (error) {
      rutaFinal = null;
    }
  }

  return {
    id: fila.id,
    usuario_id: fila.usuario_id,
    carrera_codigo: fila.carrera_codigo,
    tipo: fila.tipo,
    titulo: fila.titulo,
    creado_en: fila.creado_en,
    actualizado_en: fila.actualizado_en,
    enlace_json: `/api/simulaciones/${fila.id}/archivo`,
    archivo_local: rutaFinal
  };
}

enrutador.post('/', (req, res) => {
  const baseDatos = req.db;
  const carga = req.body || {};
  const usuarioId = resolverIdUsuario(baseDatos, carga);
  if (!usuarioId) {
    return res.status(400).json({ error: 'No se encontró el usuario asociado a la simulación.' });
  }
  const tipo = normalizarTipo(carga.tipo) || 'simulacion_siguiente_semestre';
  if (!esTipoValido(tipo)) {
    return res.status(400).json({ error: 'Tipo de simulación no permitido.' });
  }
  const carreraCodigo = String(carga.careerId || carga.carreraCodigo || carga.codigoCarrera || '').trim();
  if (!carreraCodigo) {
    return res.status(400).json({ error: 'Debe indicar el código de la carrera asociado a la simulación.' });
  }

  let contenidoJson = carga.contenido_json ?? carga.contenidoJson ?? null;
  if (typeof contenidoJson === 'string') {
    try {
      contenidoJson = JSON.parse(contenidoJson);
    } catch (error) {
      contenidoJson = null;
    }
  }
  if (!contenidoJson) {
    return res.status(400).json({ error: 'Debe incluir contenido_json.' });
  }

  const simulacionId = insertarSimulacion(baseDatos, {
    usuarioId,
    carreraCodigo,
    tipo,
    titulo: carga.title || carga.titulo || null,
    contenidoJson
  });

  return res.status(201).json(leerSimulacion(baseDatos, simulacionId));
});

enrutador.post('/probar', (req, res) => {
  const baseDatos = req.db;
  const carga = req.body || {};
  const datosEstudiante = carga.estudiante || carga.usuario || {};
  const datosCarrera = carga.carrera || (Array.isArray(datosEstudiante.carreras) ? datosEstudiante.carreras[0] : null) || null;
  const ramosDisponibles = Array.isArray(carga.ramosDisponibles) ? carga.ramosDisponibles : [];

  const rut = datosEstudiante.rut || datosEstudiante.studentRut || null;
  const email = datosEstudiante.email || datosEstudiante.correo || null;
  if (!esRutValido(rut)) {
    return res.status(400).json({ error: 'Rut inválido.' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Debe indicar el email del estudiante autenticado.' });
  }
  if (!datosCarrera) {
    return res.status(400).json({ error: 'Debe indicar la carrera asociada a la simulación.' });
  }

  try {
    const usuarioId = resolverIdUsuario(baseDatos, { usuarioId: datosEstudiante.usuarioId, estudianteId: datosEstudiante.estudianteId, rut })
      || asegurarUsuario(baseDatos, rut, email);

    const carreraCodigo = extraerCarreraCodigo(datosCarrera, carga);
    if (!carreraCodigo) {
      return res.status(400).json({ error: 'Debe indicar el código de la carrera.' });
    }

    asegurarCarrera(baseDatos, { codigo: carreraCodigo, nombre: datosCarrera?.nombre || datosCarrera?.name, catalogo: datosCarrera?.catalogo || datosCarrera?.catalog });

    const cursos = seleccionarCursosAleatorios(ramosDisponibles, 5);
    const marcaTiempo = new Date().toISOString();
    const contenidoJson = {
      tipo: 'simulacion_siguiente_semestre',
      creadoEn: marcaTiempo,
      estudiante: { rut, email },
      carrera: { codigo: carreraCodigo, nombre: datosCarrera?.nombre || datosCarrera?.name || null, catalogo: datosCarrera?.catalogo || datosCarrera?.catalog || null },
      cursos
    };

    const simulacionId = insertarSimulacion(baseDatos, {
      usuarioId,
      carreraCodigo,
      tipo: 'simulacion_siguiente_semestre',
      titulo: carga.titulo || `Simulación rápida ${new Date().toLocaleDateString('es-CL')}`,
      contenidoJson
    });

    return res.status(201).json({ mensaje: 'Simulación generada correctamente.', simulacion: leerSimulacion(baseDatos, simulacionId) });
  } catch (error) {
    console.error('[simulaciones] error al generar simulación', error);
    return res.status(500).json({ error: 'No fue posible generar la simulación solicitada.', detalle: error.message });
  }
});

enrutador.post('/proyeccion', (req, res) => {
  const baseDatos = req.db;
  const carga = req.body || {};
  const datosEstudiante = carga.estudiante || carga.usuario || {};
  const datosCarrera = carga.carrera || (Array.isArray(datosEstudiante.carreras) ? datosEstudiante.carreras[0] : null) || null;

  const rut = datosEstudiante.rut || datosEstudiante.studentRut || null;
  const email = datosEstudiante.email || datosEstudiante.correo || null;
  if (!esRutValido(rut)) {
    return res.status(400).json({ error: 'Rut inválido.' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Debe indicar el email del estudiante autenticado.' });
  }
  if (!datosCarrera) {
    return res.status(400).json({ error: 'Debe indicar la carrera asociada a la simulación.' });
  }

  let contenidoJson = carga.contenido_json ?? carga.contenidoJson ?? null;
  if (typeof contenidoJson === 'string') {
    try {
      contenidoJson = JSON.parse(contenidoJson);
    } catch (error) {
      contenidoJson = null;
    }
  }
  if (!contenidoJson) {
    return res.status(400).json({ error: 'Debe incluir contenido_json con la proyección.' });
  }

  try {
    const usuarioId = resolverIdUsuario(baseDatos, { usuarioId: datosEstudiante.usuarioId, estudianteId: datosEstudiante.estudianteId, rut })
      || asegurarUsuario(baseDatos, rut, email);

    const carreraCodigo = extraerCarreraCodigo(datosCarrera, carga);
    if (!carreraCodigo) {
      return res.status(400).json({ error: 'Debe indicar el código de la carrera.' });
    }

    asegurarCarrera(baseDatos, { codigo: carreraCodigo, nombre: datosCarrera?.nombre || datosCarrera?.name, catalogo: datosCarrera?.catalogo || datosCarrera?.catalog });

    const tipo = normalizarTipo(carga.tipo) || 'simulacion_egreso';
    if (!esTipoValido(tipo)) {
      return res.status(400).json({ error: 'Tipo de simulación no permitido.' });
    }

    const marcaTiempo = new Date().toISOString();
    const contenidoJsonFinal = {
      tipo: tipo,
      creadoEn: marcaTiempo,
      estudiante: { rut, email },
      carrera: { codigo: carreraCodigo, nombre: datosCarrera?.nombre || datosCarrera?.name || null, catalogo: datosCarrera?.catalogo || datosCarrera?.catalog || null },
      parametros: carga.parametros || null,
      ...contenidoJson
    };

    const simulacionId = insertarSimulacion(baseDatos, {
      usuarioId,
      carreraCodigo,
      tipo: tipo,
      titulo: carga.titulo || `Simulación de egreso ${new Date().toLocaleDateString('es-CL')}`,
      contenidoJson: contenidoJsonFinal
    });

    return res.status(201).json({ mensaje: 'Simulación de egreso guardada correctamente.', simulacion: leerSimulacion(baseDatos, simulacionId) });
  } catch (error) {
    console.error('[simulaciones] error al guardar simulación de egreso', error);
    return res.status(500).json({ error: 'No fue posible guardar la simulación de egreso.', detalle: error.message });
  }
});

const rutasPorEstudiante = ['/estudiante/:identificador', '/student/:identifier'];

enrutador.get(rutasPorEstudiante, (req, res) => {
  const baseDatos = req.db;
  const identificador = req.params.identificador ?? req.params.identifier;
  let usuarioId;

  if (/^\d+$/.test(String(identificador))) {
    const posibleId = Number(identificador);
    const existePorId = baseDatos.prepare('SELECT id FROM usuarios WHERE id = ?').get(posibleId);
    if (existePorId) {
      usuarioId = posibleId;
    } else {
      if (!esRutValido(identificador)) {
        return res.status(400).json({ error: 'Rut inválido.' });
      }
      const fila = baseDatos.prepare('SELECT id FROM usuarios WHERE rut = ?').get(identificador);
      usuarioId = fila?.id;
    }
  } else {
    if (!esRutValido(identificador)) {
      return res.status(400).json({ error: 'Rut inválido.' });
    }
    const fila = baseDatos.prepare('SELECT id FROM usuarios WHERE rut = ?').get(identificador);
    usuarioId = fila?.id;
  }

  if (!usuarioId) {
    return res.status(404).json({ error: 'Estudiante no encontrado.' });
  }

  const filtroTipo = normalizarTipo(req.query?.tipo) || null;
  const consulta = filtroTipo
    ? baseDatos.prepare('SELECT id FROM simulaciones WHERE usuario_id = ? AND tipo = ? ORDER BY creado_en DESC')
    : baseDatos.prepare('SELECT id FROM simulaciones WHERE usuario_id = ? ORDER BY creado_en DESC');

  const filas = filtroTipo ? consulta.all(usuarioId, filtroTipo) : consulta.all(usuarioId);
  const simulaciones = filas
    .map((fila) => leerSimulacion(baseDatos, fila.id))
    .filter(Boolean);
  return res.json(simulaciones);
});

enrutador.get('/:id/archivo', (req, res) => {
  const baseDatos = req.db;
  let id = req.params?.id ?? null;
  if (!id) {
    const match = String(req.path || '').match(/^\/(\d+)\/archivo\/?$/);
    id = match ? match[1] : null;
  }

  const idNormalizado = String(id || '').trim();
  if (!/^\d+$/.test(idNormalizado)) {
    return res.status(400).json({ error: 'Id inválido.' });
  }
  const idNumerico = Number(idNormalizado);
  const fila = baseDatos
    .prepare(
      `SELECT s.contenido_json, s.tipo, u.rut AS rut_usuario
         FROM simulaciones s
         JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.id = ?`
    )
    .get(idNumerico);
  if (!fila) {
    return res.status(404).json({ error: 'Simulación no encontrada.' });
  }
  let contenido = null;
  try {
    contenido = JSON.parse(fila.contenido_json);
  } catch (error) {
    contenido = { tipo: fila.tipo, simulacionId: idNumerico };
  }
  const tipo = normalizarTipo(fila.tipo) || null;
  if (!obtenerRutaArchivoSimulacion(idNormalizado, fila.rut_usuario, tipo)) {
    try {
      guardarArchivoSimulacion(idNormalizado, fila.rut_usuario, contenido, tipo);
    } catch (error) {
      return res.status(500).json({ error: 'No fue posible generar el archivo de simulación.' });
    }
  }
  res.setHeader('Content-Disposition', `attachment; filename=simulacion-${idNormalizado}.json`);
  res.type('application/json');
  return res.json(contenido);
});

enrutador.get('/:id', (req, res) => {
  const baseDatos = req.db;
  const { id } = req.params;
  const simulacion = leerSimulacion(baseDatos, id);
  if (!simulacion) {
    return res.status(404).json({ error: 'Simulación no encontrada.' });
  }
  return res.json(simulacion);
});

enrutador.delete('/:id', (req, res) => {
  const baseDatos = req.db;
  const { id } = req.params;
  const fila = baseDatos
    .prepare(
      `SELECT s.id, s.tipo, u.rut AS rut_usuario
         FROM simulaciones s
         JOIN usuarios u ON u.id = s.usuario_id
        WHERE s.id = ?`
    )
    .get(Number(id));
  if (!fila) {
    return res.status(404).json({ error: 'Simulación no encontrada.' });
  }
  const resultado = baseDatos.prepare('DELETE FROM simulaciones WHERE id = ?').run(Number(id));
  if (!resultado.changes) {
    return res.status(404).json({ error: 'Simulación no encontrada.' });
  }
  eliminarArchivoSimulacion(id, fila.rut_usuario, fila.tipo);
  return res.json({ mensaje: 'Simulación eliminada correctamente.' });
});

module.exports = enrutador;

