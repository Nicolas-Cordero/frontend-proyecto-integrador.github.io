const express = require('express');

const enrutador = express.Router();

function normalizarRamo(ramo) {
  return {
    codigo: ramo.codigo || ramo.code || null,
    asignatura: ramo.asignatura || ramo.nombre || ramo.name || 'Ramo sin nombre',
    nivel: ramo.nivel || ramo.level || null,
    creditos: ramo.creditos || ramo.credits || null,
    prereq: ramo.prereq || ramo.prerequisitos || ramo.prerequisitosRaw || null,
    respaldoCompleto: JSON.stringify(ramo)
  };
}

function buscarRamoExistente(baseDatos, carreraId, ramoNormalizado) {
  if (ramoNormalizado.codigo) {
    return baseDatos.prepare('SELECT id FROM malla_cursos WHERE carrera_id = ? AND codigo = ?').get(carreraId, ramoNormalizado.codigo);
  }

  return baseDatos
    .prepare(
      'SELECT id FROM malla_cursos WHERE carrera_id = ? AND asignatura = ? AND (nivel = ? OR (nivel IS NULL AND ? IS NULL))'
    )
    .get(carreraId, ramoNormalizado.asignatura, ramoNormalizado.nivel, ramoNormalizado.nivel);
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
    INSERT INTO malla_cursos (carrera_id, codigo, asignatura, nivel, creditos, prereq, datos_crudos, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const actualizarRamo = baseDatos.prepare(`
    UPDATE malla_cursos
       SET asignatura = ?, nivel = ?, creditos = ?, prereq = ?, datos_crudos = ?, actualizado_en = ?
     WHERE id = ?
  `);

  ramos.forEach((ramo) => {
    const normalizado = normalizarRamo(ramo);
    const existente = buscarRamoExistente(baseDatos, carreraId, normalizado);

    if (existente) {
      actualizarRamo.run(
        normalizado.asignatura,
        normalizado.nivel,
        normalizado.creditos,
        normalizado.prereq,
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
      normalizado.asignatura,
      normalizado.nivel,
      normalizado.creditos,
      normalizado.prereq,
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
    .prepare('SELECT id, codigo, asignatura, nivel, creditos, prereq FROM malla_cursos WHERE carrera_id = ? ORDER BY nivel, asignatura')
    .all(carreraId);

  return res.json(filas);
});

module.exports = enrutador;
