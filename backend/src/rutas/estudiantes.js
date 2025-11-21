const express = require('express');

const enrutador = express.Router();

function guardarEstudiante(baseDatos, datos) {
  const {
    rut,
    email,
    name,
    firstName,
    lastName,
    profilePicture,
    role
  } = datos;

  const correo = email || datos.correo || null;
  const nombre = firstName || datos.nombre || null;
  const apellido = lastName || datos.apellido || null;
  const nombreCompleto = datos.fullName || name || `${nombre || ''} ${apellido || ''}`.trim();
  const fotoPerfil = profilePicture || datos.fotoPerfil || null;
  const rol = role || datos.rol || 'estudiante';

  const existente = baseDatos.prepare('SELECT id FROM estudiantes WHERE rut = ?').get(rut);
  const marcaTiempo = new Date().toISOString();

  if (existente) {
    baseDatos.prepare(`
      UPDATE estudiantes
         SET correo = ?, nombre = ?, apellido = ?, nombre_completo = ?, foto_perfil = ?, rol = ?, actualizado_en = ?
       WHERE id = ?
    `).run(correo, nombre, apellido, nombreCompleto, fotoPerfil, rol, marcaTiempo, existente.id);
    return existente.id;
  }

  const insercion = baseDatos.prepare(`
    INSERT INTO estudiantes (rut, correo, nombre, apellido, nombre_completo, foto_perfil, rol, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(rut, correo, nombre, apellido, nombreCompleto, fotoPerfil, rol, marcaTiempo, marcaTiempo);

  return insercion.lastInsertRowid;
}

function guardarCarrera(baseDatos, datos) {
  const identificadorExterno = datos.externalId ?? datos.id ?? datos.codigo ?? datos.catalogo ?? datos.nombre;
  const codigoCatalogo = datos.catalog_code ?? datos.catalogo ?? null;
  const marcaTiempo = new Date().toISOString();

  const existente = baseDatos
    .prepare(`
      SELECT id
        FROM carreras
       WHERE identificador_externo = @identificadorExterno
         AND (
           codigo_catalogo = @codigoCatalogo
           OR (codigo_catalogo IS NULL AND @codigoCatalogo IS NULL)
         )
    `)
    .get({ identificadorExterno, codigoCatalogo });

  if (existente) {
    baseDatos.prepare(`
      UPDATE carreras
         SET nombre = ?, campus = ?, jornada = ?, titulo_grado = ?, actualizado_en = ?
       WHERE id = ?
    `).run(
      datos.nombre || datos.name,
      datos.campus || null,
      datos.jornada || null,
      datos.degreeTitle || datos.titulo || null,
      marcaTiempo,
      existente.id
    );
    return existente.id;
  }

  const insercion = baseDatos.prepare(`
    INSERT INTO carreras (identificador_externo, nombre, codigo_catalogo, campus, jornada, titulo_grado, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    identificadorExterno,
    datos.nombre || datos.name,
    codigoCatalogo,
    datos.campus || null,
    datos.jornada || null,
    datos.degreeTitle || datos.titulo || null,
    marcaTiempo,
    marcaTiempo
  );

  return insercion.lastInsertRowid;
}

function guardarRelacionAcademica(baseDatos, datos) {
  const marcaTiempo = new Date().toISOString();
  const existente = baseDatos
    .prepare('SELECT id FROM estudiantes_carreras WHERE estudiante_id = ? AND carrera_id = ?')
    .get(datos.estudianteId, datos.carreraId);

  if (existente) {
    baseDatos.prepare(`
      UPDATE estudiantes_carreras
         SET generacion = ?, semestre_actual = ?, total_semestres = ?, promedio = ?, ramos_aprobados = ?, ramos_cursando = ?, estado = ?, actualizado_en = ?
       WHERE id = ?
    `).run(
      datos.generacion,
      datos.semestreActual,
      datos.totalSemestres,
      datos.promedio,
      datos.ramosAprobados,
      datos.ramosActuales,
      datos.estado,
      marcaTiempo,
      existente.id
    );
    return existente.id;
  }

  const insercion = baseDatos.prepare(`
    INSERT INTO estudiantes_carreras (
      estudiante_id, carrera_id, generacion, semestre_actual, total_semestres, promedio, ramos_aprobados, ramos_cursando, estado, creado_en, actualizado_en
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    datos.estudianteId,
    datos.carreraId,
    datos.generacion,
    datos.semestreActual,
    datos.totalSemestres,
    datos.promedio,
    datos.ramosAprobados,
    datos.ramosActuales,
    datos.estado,
    marcaTiempo,
    marcaTiempo
  );

  return insercion.lastInsertRowid;
}

enrutador.post(['/sincronizar', '/sync'], (req, res) => {
  const baseDatos = req.db;
  const carga = req.body;

  if (!carga || !carga.rut) {
    return res.status(400).json({ error: 'El cuerpo debe incluir el rut del estudiante.' });
  }

  try {
    const estudianteId = guardarEstudiante(baseDatos, carga);
    const detalleCarreras = Array.isArray(carga.carreras) ? carga.carreras : [];
    const carrerasProcesadas = [];

    detalleCarreras.forEach((carrera) => {
      const carreraId = guardarCarrera(baseDatos, carrera);
      guardarRelacionAcademica(baseDatos, {
        estudianteId,
        carreraId,
        generacion: carrera.generation || carrera.generacion || null,
        semestreActual: carrera.currentSemester || carrera.semestreActual || null,
        totalSemestres: carrera.totalSemesters || carrera.semestresTotales || null,
        promedio: carrera.gpa || carrera.promedio || null,
        ramosAprobados: carrera.approvedCourses || carrera.ramosAprobados || null,
        ramosActuales: carrera.currentCourses || carrera.ramosActuales || null,
        estado: carrera.status || carrera.estado || null
      });

      carrerasProcesadas.push({
        carreraId,
        nombre: carrera.nombre || carrera.name,
        codigoCatalogo: carrera.catalogo || carrera.catalog_code || null
      });
    });

    return res.json({
      estudianteId,
      rut: carga.rut,
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
  let estudiante;

  if (/^\d+$/.test(identificador)) {
    estudiante = baseDatos.prepare('SELECT * FROM estudiantes WHERE id = ?').get(Number(identificador));
  } else {
    estudiante = baseDatos.prepare('SELECT * FROM estudiantes WHERE rut = ?').get(identificador);
  }

  if (!estudiante) {
    return res.status(404).json({ error: 'Estudiante no encontrado.' });
  }

  const carreras = baseDatos
    .prepare(`
      SELECT ec.*, c.nombre as nombre_carrera, c.codigo_catalogo
        FROM estudiantes_carreras ec
        JOIN carreras c ON c.id = ec.carrera_id
       WHERE ec.estudiante_id = ?
    `)
    .all(estudiante.id);

  return res.json({ estudiante, carreras });
});

module.exports = enrutador;
