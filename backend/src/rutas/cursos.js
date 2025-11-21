const express = require('express');

const enrutador = express.Router();

function normalizarRamo(ramo) {
  return {
    codigo: ramo.codigo || ramo.code || null,
    nombre: ramo.asignatura || ramo.nombre || ramo.name || 'Ramo sin nombre',
    nivel: ramo.nivel || ramo.level || null,
    creditos: ramo.creditos || ramo.credits || null,
    horas: ramo.horas || ramo.hours || null,
    categoria: ramo.tipo || ramo.category || null,
    respaldoCompleto: JSON.stringify(ramo)
  };
}

function buscarRamoExistente(baseDatos, carreraId, ramoNormalizado) {
  if (ramoNormalizado.codigo) {
    return baseDatos.prepare('SELECT id FROM ramos WHERE carrera_id = ? AND codigo = ?').get(carreraId, ramoNormalizado.codigo);
  }

  return baseDatos
    .prepare(
      'SELECT id FROM ramos WHERE carrera_id = ? AND nombre = ? AND (nivel = ? OR (nivel IS NULL AND ? IS NULL))'
    )
    .get(carreraId, ramoNormalizado.nombre, ramoNormalizado.nivel, ramoNormalizado.nivel);
}

const rutasImportacion = ['/carreras/:carreraId/ramos/importar', '/careers/:careerId/courses/import'];

enrutador.post(rutasImportacion, (req, res) => {
  const baseDatos = req.db;
  const carreraId = Number(req.params.carreraId ?? req.params.careerId);
  const ramos = Array.isArray(req.body?.courses || req.body?.ramos)
    ? req.body.courses || req.body.ramos
    : Array.isArray(req.body)
      ? req.body
      : [];

  if (!carreraId) {
    return res.status(400).json({ error: 'carreraId inválido.' });
  }

  const carreraExiste = baseDatos.prepare('SELECT id FROM carreras WHERE id = ?').get(carreraId);
  if (!carreraExiste) {
    return res.status(404).json({ error: 'La carrera indicada no existe.' });
  }

  if (!ramos.length) {
    return res.status(400).json({ error: 'Debe enviar un arreglo de ramos para importar.' });
  }

  const estadisticas = { creados: 0, actualizados: 0 };
  const marcaTiempo = new Date().toISOString();

  const insertarRamo = baseDatos.prepare(`
    INSERT INTO ramos (carrera_id, codigo, nombre, nivel, creditos, horas, categoria, datos_crudos, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const actualizarRamo = baseDatos.prepare(`
    UPDATE ramos
       SET nombre = ?, nivel = ?, creditos = ?, horas = ?, categoria = ?, datos_crudos = ?, actualizado_en = ?
     WHERE id = ?
  `);

  ramos.forEach((ramo) => {
    const normalizado = normalizarRamo(ramo);
    const existente = buscarRamoExistente(baseDatos, carreraId, normalizado);

    if (existente) {
      actualizarRamo.run(
        normalizado.nombre,
        normalizado.nivel,
        normalizado.creditos,
        normalizado.horas,
        normalizado.categoria,
        normalizado.respaldoCompleto,
        marcaTiempo,
        existente.id
      );
      estadisticas.actualizados += 1;
      return;
    }

    insertarRamo.run(
      carreraId,
      normalizado.codigo,
      normalizado.nombre,
      normalizado.nivel,
      normalizado.creditos,
      normalizado.horas,
      normalizado.categoria,
      normalizado.respaldoCompleto,
      marcaTiempo,
      marcaTiempo
    );
    estadisticas.creados += 1;
  });

  return res.json({
    ramosRecibidos: ramos.length,
    ...estadisticas
  });
});

const rutasListado = ['/carreras/:carreraId/ramos', '/careers/:careerId/courses'];

enrutador.get(rutasListado, (req, res) => {
  const baseDatos = req.db;
  const carreraId = Number(req.params.carreraId ?? req.params.careerId);

  if (!carreraId) {
    return res.status(400).json({ error: 'carreraId inválido.' });
  }

  const filas = baseDatos
    .prepare('SELECT id, codigo, nombre, nivel, creditos, horas, categoria FROM ramos WHERE carrera_id = ? ORDER BY nivel, nombre')
    .all(carreraId);

  return res.json(filas);
});

module.exports = enrutador;
