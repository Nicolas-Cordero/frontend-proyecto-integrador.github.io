const express = require('express');

const enrutador = express.Router();

function asegurarUsuario(baseDatos, datos) {
  const rut = datos?.rut || null;
  const email = datos?.email || datos?.correo || null;
  if (!rut) {
    throw new Error('El cuerpo debe incluir el rut del estudiante.');
  }
  if (!email) {
    throw new Error('El cuerpo debe incluir el email del estudiante.');
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

function asegurarCarrera(baseDatos, datos) {
  const codigo = String(datos?.codigo || datos?.code || datos?.id || '').trim();
  if (!codigo) {
    return null;
  }
  const nombre = String(datos?.nombre || datos?.name || '').trim() || `Carrera ${codigo}`;
  const catalogo = datos?.catalogo || datos?.catalog || datos?.catalog_code || null;
  const marcaTiempo = new Date().toISOString();

  const existente = baseDatos.prepare('SELECT id FROM carreras WHERE codigo = ?').get(codigo);
  if (existente) {
    baseDatos
      .prepare('UPDATE carreras SET nombre = ?, catalogo = ?, actualizado_en = ? WHERE id = ?')
      .run(nombre, catalogo, marcaTiempo, existente.id);
    return existente.id;
  }

  const insercion = baseDatos
    .prepare('INSERT INTO carreras (codigo, nombre, catalogo, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?)')
    .run(codigo, nombre, catalogo, marcaTiempo, marcaTiempo);
  return insercion.lastInsertRowid;
}

function asegurarRelacionUsuarioCarrera(baseDatos, usuarioId, carreraId) {
  if (!usuarioId || !carreraId) {
    return null;
  }
  const marcaTiempo = new Date().toISOString();
  const existente = baseDatos
    .prepare('SELECT id FROM usuarios_carreras WHERE usuario_id = ? AND carrera_id = ?')
    .get(usuarioId, carreraId);
  if (existente) {
    baseDatos.prepare('UPDATE usuarios_carreras SET actualizado_en = ? WHERE id = ?').run(marcaTiempo, existente.id);
    return existente.id;
  }
  const insercion = baseDatos
    .prepare('INSERT INTO usuarios_carreras (usuario_id, carrera_id, creado_en, actualizado_en) VALUES (?, ?, ?, ?)')
    .run(usuarioId, carreraId, marcaTiempo, marcaTiempo);
  return insercion.lastInsertRowid;
}

enrutador.post(['/sincronizar', '/sync'], (req, res) => {
  const baseDatos = req.db;
  const carga = req.body;

  if (!carga || !carga.rut) {
    return res.status(400).json({ error: 'El cuerpo debe incluir el rut del estudiante.' });
  }

  try {
    const usuarioId = asegurarUsuario(baseDatos, carga);
    const detalleCarreras = Array.isArray(carga.carreras) ? carga.carreras : [];
    const carrerasProcesadas = [];

    detalleCarreras.forEach((carrera) => {
      const carreraId = asegurarCarrera(baseDatos, carrera);
      asegurarRelacionUsuarioCarrera(baseDatos, usuarioId, carreraId);

      carrerasProcesadas.push({
        carreraId,
        codigo: carrera.codigo || carrera.code || carrera.id || null,
        nombre: carrera.nombre || carrera.name,
        catalogo: carrera.catalogo || carrera.catalog || carrera.catalog_code || null
      });
    });

    return res.json({
      estudianteId: usuarioId,
      usuarioId,
      rut: carga.rut,
      email: carga.email || carga.correo || null,
      carreras: carrerasProcesadas,
      mensaje: 'Datos del estudiante sincronizados correctamente.'
    });
  } catch (error) {
    console.error('[estudiantes] error al sincronizar', error);
    return res.status(500).json({ error: 'Error al sincronizar el estudiante.' });
  }
});

enrutador.get('/:identificador', (req, res) => {
  const baseDatos = req.db;
  const { identificador } = req.params;
  let usuario;

  if (/^\d+$/.test(identificador)) {
    usuario = baseDatos.prepare('SELECT id, rut, email FROM usuarios WHERE id = ?').get(Number(identificador));
  } else {
    usuario = baseDatos.prepare('SELECT id, rut, email FROM usuarios WHERE rut = ?').get(identificador);
  }

  if (!usuario) {
    return res.status(404).json({ error: 'Estudiante no encontrado.' });
  }

  const carreras = baseDatos
    .prepare(`
      SELECT uc.id, c.codigo, c.nombre, c.catalogo
        FROM usuarios_carreras uc
        JOIN carreras c ON c.id = uc.carrera_id
       WHERE uc.usuario_id = ?
    `)
    .all(usuario.id);

  return res.json({ estudiante: { id: usuario.id, rut: usuario.rut, correo: usuario.email }, carreras });
});

module.exports = enrutador;
