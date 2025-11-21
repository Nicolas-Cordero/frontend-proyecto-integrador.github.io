const express = require('express');

const {
  guardarArchivoSimulacion,
  obtenerRutaArchivoSimulacion,
  eliminarArchivoSimulacion
} = require('../utilidades/archivos-simulaciones');

const enrutador = express.Router();

function resolverIdEstudiante(baseDatos, identificador) {
  if (identificador?.studentId || identificador?.estudianteId) {
    const id = Number(identificador.studentId ?? identificador.estudianteId);
    return Number.isInteger(id) ? id : null;
  }

  const rut = identificador?.studentRut ?? identificador?.rutEstudiante;
  if (rut) {
    const estudiante = baseDatos.prepare('SELECT id FROM estudiantes WHERE rut = ?').get(rut);
    return estudiante ? estudiante.id : null;
  }

  return null;
}

function construirContenidoArchivo(simulacion) {
  return {
    simulacion: {
      id: simulacion.id,
      titulo: simulacion.titulo,
      periodoObjetivo: simulacion.periodo_objetivo,
      creditosTotales: simulacion.creditos_totales,
      notas: simulacion.notas,
      creadoEn: simulacion.creado_en,
      actualizadoEn: simulacion.actualizado_en
    },
    estudiante: simulacion.estudiante || null,
    carrera: simulacion.carrera || null,
    ramos: (simulacion.ramos || []).map((r) => ({
      codigo: r.codigo,
      nombre: r.nombre,
      nivel: r.nivel,
      creditos: r.creditos,
      estado: r.estado,
      prioridad: r.prioridad,
      notaEsperada: r.notaEsperada
    }))
  };
}

function agregarMetadatosArchivo(simulacion, rutaArchivo) {
  return {
    ...simulacion,
    enlace_json: `/api/simulaciones/${simulacion.id}/archivo`,
    archivo_local: rutaArchivo || null
  };
}

function obtenerSimulacion(baseDatos, id) {
  const simulacion = baseDatos.prepare('SELECT * FROM simulaciones WHERE id = ?').get(id);
  if (!simulacion) {
    return null;
  }

  const estudiante = baseDatos
    .prepare('SELECT id, rut, correo, nombre, apellido, nombre_completo FROM estudiantes WHERE id = ?')
    .get(simulacion.estudiante_id);

  const carrera = baseDatos
    .prepare('SELECT id, nombre, codigo_catalogo FROM carreras WHERE id = ?')
    .get(simulacion.carrera_id);

  const ramos = baseDatos
    .prepare(
      `SELECT id,
              ramo_id     AS ramoId,
              codigo,
              nombre,
              nivel,
              creditos,
              estado,
              prioridad,
              nota_esperada AS notaEsperada,
              foto_ramo     AS fotoRamo
         FROM simulaciones_ramos
        WHERE simulacion_id = ?`
    )
    .all(simulacion.id)
    .map((ramo) => ({
      ...ramo,
      fotoRamo: ramo.fotoRamo ? JSON.parse(ramo.fotoRamo) : null
    }));

  const simulacionCompleta = {
    ...simulacion,
    estudiante,
    carrera,
    ramos
  };

  let rutaFinal = obtenerRutaArchivoSimulacion(simulacion.id);
  if (!rutaFinal) {
    try {
      rutaFinal = guardarArchivoSimulacion(simulacion.id, construirContenidoArchivo(simulacionCompleta));
    } catch (error) {
      console.error('[simulaciones] no se pudo guardar el archivo JSON', error);
    }
  }

  return agregarMetadatosArchivo(simulacionCompleta, rutaFinal);
}

function normalizarCursos(cursos) {
  if (!Array.isArray(cursos)) {
    return [];
  }

  return cursos.map((ramo) => ({
    codigo: ramo.code || ramo.codigo || null,
    nombre: ramo.name || ramo.asignatura || ramo.nombre || 'Ramo sin nombre',
    nivel: ramo.level || ramo.nivel || null,
    creditos: ramo.credits || ramo.creditos || null,
    estado: ramo.status || 'planificado',
    prioridad: ramo.priority || null,
    notaEsperada: ramo.expectedGrade || null,
    respaldo: JSON.stringify(ramo)
  }));
}

function crearRegistroSimulacion(baseDatos, datos) {
  const ramosNormalizados = normalizarCursos(datos.cursos);
  const creditosTotales = ramosNormalizados.reduce((acumulado, ramo) => acumulado + (Number(ramo.creditos) || 0), 0);
  const marcaTiempo = new Date().toISOString();

  const insertarSimulacion = baseDatos.prepare(`
    INSERT INTO simulaciones (estudiante_id, carrera_id, titulo, periodo_objetivo, creditos_totales, notas, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insercion = insertarSimulacion.run(
    datos.estudianteId,
    datos.carreraId,
    datos.titulo || 'Simulación sin nombre',
    datos.periodoObjetivo || null,
    creditosTotales,
    datos.notas || null,
    marcaTiempo,
    marcaTiempo
  );

  const simulacionId = insercion.lastInsertRowid;

  if (ramosNormalizados.length) {
    const insertarDetalle = baseDatos.prepare(`
      INSERT INTO simulaciones_ramos (
        simulacion_id, ramo_id, codigo, nombre, nivel, creditos, estado, prioridad, nota_esperada, foto_ramo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    ramosNormalizados.forEach((ramo) => {
      let ramoVinculado = null;
      if (ramo.codigo) {
        ramoVinculado = baseDatos.prepare('SELECT id FROM ramos WHERE carrera_id = ? AND codigo = ?').get(datos.carreraId, ramo.codigo);
      }

      insertarDetalle.run(
        simulacionId,
        ramoVinculado ? ramoVinculado.id : null,
        ramo.codigo,
        ramo.nombre,
        ramo.nivel,
        ramo.creditos,
        ramo.estado,
        ramo.prioridad,
        ramo.notaEsperada,
        ramo.respaldo
      );
    });
  }

  return obtenerSimulacion(baseDatos, simulacionId);
}

function asegurarEstudiante(baseDatos, datos) {
  const rut = datos.rut || datos.studentRut;
  if (!rut) {
    throw new Error('Falta el rut del estudiante.');
  }

  const correo = datos.correo || datos.email || null;
  const nombre = datos.nombre || datos.firstName || null;
  const apellido = datos.apellido || datos.lastName || null;
  const nombreCompleto = datos.nombreCompleto || datos.fullName || `${nombre || ''} ${apellido || ''}`.trim() || null;
  const fotoPerfil = datos.fotoPerfil || datos.profilePicture || null;
  const rol = datos.rol || 'estudiante';
  const marcaTiempo = new Date().toISOString();
  const existente = baseDatos.prepare('SELECT id FROM estudiantes WHERE rut = ?').get(rut);

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

function asegurarCarrera(baseDatos, datosEntrada) {
  if (!datosEntrada) {
    throw new Error('Falta la información de la carrera.');
  }

  const datos = typeof datosEntrada === 'string' ? { nombre: datosEntrada } : datosEntrada;
  const identificador =
    datos.identificador_externo ||
    datos.externalId ||
    datos.id ||
    datos.codigo ||
    datos.catalog ||
    datos.catalogo ||
    datos.catalog_code ||
    datos.nombre;
  const nombre = datos.nombre || datos.name;
  if (!nombre) {
    throw new Error('La carrera debe tener un nombre.');
  }

  const codigoCatalogo = datos.codigo_catalogo || datos.catalogo || datos.catalog_code || null;
  const marcaTiempo = new Date().toISOString();
  const existente = baseDatos.prepare(
    `SELECT id FROM carreras WHERE identificador_externo = ? AND (
        codigo_catalogo = ? OR (codigo_catalogo IS NULL AND ? IS NULL)
      )`
  ).get(identificador, codigoCatalogo, codigoCatalogo);

  if (existente) {
    baseDatos.prepare(`
      UPDATE carreras
         SET nombre = ?, campus = ?, jornada = ?, titulo_grado = ?, actualizado_en = ?
       WHERE id = ?
    `).run(
      nombre,
      datos.campus || null,
      datos.jornada || null,
      datos.titulo_grado || datos.titulo || datos.degreeTitle || null,
      marcaTiempo,
      existente.id
    );
    return existente.id;
  }

  const insercion = baseDatos.prepare(`
    INSERT INTO carreras (identificador_externo, nombre, codigo_catalogo, campus, jornada, titulo_grado, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    identificador,
    nombre,
    codigoCatalogo,
    datos.campus || null,
    datos.jornada || null,
    datos.titulo_grado || datos.titulo || datos.degreeTitle || null,
    marcaTiempo,
    marcaTiempo
  );

  return insercion.lastInsertRowid;
}

function asegurarRelacionAcademica(baseDatos, datos) {
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

function generarRamosSimulados(cantidad) {
  const ramos = [];
  for (let indice = 1; indice <= cantidad; indice += 1) {
    ramos.push({
      codigo: `SIM${indice}`,
      nombre: `Ramo simulado ${indice}`,
      nivel: indice,
      creditos: 5
    });
  }
  return ramos;
}

function normalizarRamoDisponible(ramo) {
  if (!ramo) {
    return null;
  }

  const nombre = ramo.nombre || ramo.asignatura || ramo.name || null;
  if (!nombre) {
    return null;
  }

  return {
    id: null,
    codigo: ramo.codigo || ramo.code || null,
    nombre,
    nivel: Number(ramo.nivel || ramo.level) || null,
    creditos: Number(ramo.creditos || ramo.credits || ramo.horas) || 5
  };
}

function seleccionarDesdeLista(lista, cantidad) {
  const normalizados = lista.map(normalizarRamoDisponible).filter(Boolean);
  if (!normalizados.length) {
    return generarRamosSimulados(cantidad);
  }

  const copia = [...normalizados];
  const seleccion = [];
  while (seleccion.length < cantidad && copia.length) {
    const indice = Math.floor(Math.random() * copia.length);
    seleccion.push(copia.splice(indice, 1)[0]);
  }

  if (seleccion.length < cantidad) {
    return [...seleccion, ...generarRamosSimulados(cantidad - seleccion.length)];
  }

  return seleccion;
}

function seleccionarRamosAleatorios(baseDatos, carreraId, cantidad, alternativas = []) {
  const ramos = baseDatos
    .prepare('SELECT id, codigo, nombre, nivel, creditos FROM ramos WHERE carrera_id = ? ORDER BY RANDOM()')
    .all(carreraId);

  if (!ramos.length) {
    if (alternativas.length) {
      return seleccionarDesdeLista(alternativas, cantidad);
    }
    return generarRamosSimulados(cantidad);
  }

  if (ramos.length <= cantidad) {
    const faltantes = cantidad - ramos.length;
    return faltantes > 0 ? [...ramos, ...generarRamosSimulados(faltantes)] : ramos;
  }

  const seleccion = [];
  const disponible = [...ramos];
  while (seleccion.length < cantidad && disponible.length) {
    const indice = Math.floor(Math.random() * disponible.length);
    seleccion.push(disponible.splice(indice, 1)[0]);
  }
  return seleccion;
}

enrutador.post('/', (req, res) => {
  const baseDatos = req.db;
  const { studentId, studentRut, careerId, title, targetTerm, notes, courses = [] } = req.body || {};

  if (!careerId) {
    return res.status(400).json({ error: 'Debe indicar el careerId (carreraId) asociado a la simulación.' });
  }

  const estudianteId = resolverIdEstudiante(baseDatos, { studentId, estudianteId: req.body?.estudianteId, studentRut });
  if (!estudianteId) {
    return res.status(400).json({ error: 'No se encontró el estudiante asociado a la simulación.' });
  }

  const carreraExiste = baseDatos.prepare('SELECT id FROM carreras WHERE id = ?').get(careerId);
  if (!carreraExiste) {
    return res.status(404).json({ error: 'La carrera indicada no existe.' });
  }

  const simulacion = crearRegistroSimulacion(baseDatos, {
    estudianteId,
    carreraId: careerId,
    titulo: title || req.body?.titulo || 'Simulación sin nombre',
    periodoObjetivo: targetTerm || req.body?.periodoObjetivo || null,
    notas: notes || req.body?.notas || null,
    cursos: courses
  });

  return res.status(201).json(simulacion);
});

const rutasPorEstudiante = ['/estudiante/:identificador', '/student/:identifier'];

enrutador.get(rutasPorEstudiante, (req, res) => {
  const baseDatos = req.db;
  const identificador = req.params.identificador ?? req.params.identifier;
  let estudianteId;

  if (/^\d+$/.test(identificador)) {
    estudianteId = Number(identificador);
  } else {
    const estudiante = baseDatos.prepare('SELECT id FROM estudiantes WHERE rut = ?').get(identificador);
    estudianteId = estudiante?.id;
  }

  if (!estudianteId) {
    return res.status(404).json({ error: 'Estudiante no encontrado.' });
  }

  const simulaciones = baseDatos
    .prepare('SELECT * FROM simulaciones WHERE estudiante_id = ? ORDER BY creado_en DESC')
    .all(estudianteId)
    .map((fila) => obtenerSimulacion(baseDatos, fila.id));

  return res.json(simulaciones);
});

enrutador.get('/:id/archivo', (req, res) => {
  const baseDatos = req.db;
  const { id } = req.params;
  const simulacion = obtenerSimulacion(baseDatos, id);

  if (!simulacion) {
    return res.status(404).json({ error: 'Simulación no encontrada.' });
  }

  const ruta = obtenerRutaArchivoSimulacion(id);
  if (!ruta) {
    return res.status(500).json({ error: 'No fue posible generar el archivo de simulación.' });
  }

  res.setHeader('Content-Disposition', `attachment; filename=simulacion-${id}.json`);
  res.type('application/json');
  return res.sendFile(ruta);
});

enrutador.get('/:id', (req, res) => {
  const baseDatos = req.db;
  const { id } = req.params;
  const simulacion = obtenerSimulacion(baseDatos, id);

  if (!simulacion) {
    return res.status(404).json({ error: 'Simulación no encontrada.' });
  }

  return res.json(simulacion);
});

enrutador.post('/probar', (req, res) => {
  const baseDatos = req.db;
  const carga = req.body || {};
  const datosEstudiante = carga.estudiante || carga.usuario || {};
  const datosCarrera = carga.carrera || carga.carreraPreferida || (datosEstudiante.carreras?.[0]) || null;
  const ramosDisponibles = Array.isArray(carga.ramosDisponibles) ? carga.ramosDisponibles : [];

  console.log('[simulaciones] carga recibida para probar:', {
    estudiante: {
      rut: datosEstudiante.rut || datosEstudiante.studentRut,
      email: datosEstudiante.email
    },
    carrera: datosCarrera ? { nombre: datosCarrera.nombre || datosCarrera.name, catalogo: datosCarrera.catalogo || datosCarrera.catalog } : null
  });

  if (!datosEstudiante.rut && !datosEstudiante.studentRut) {
    return res.status(400).json({ error: 'Debe indicar el rut del estudiante autenticado.' });
  }

  if (!datosCarrera) {
    return res.status(400).json({ error: 'Debe indicar la carrera asociada a la simulación.' });
  }

  try {
    const estudianteId = asegurarEstudiante(baseDatos, datosEstudiante);
    const carreraId = asegurarCarrera(baseDatos, datosCarrera);
    asegurarRelacionAcademica(baseDatos, {
      estudianteId,
      carreraId,
      generacion: datosCarrera.generacion || datosCarrera.generation || null,
      semestreActual: datosCarrera.semestreActual || datosCarrera.currentSemester || null,
      totalSemestres: datosCarrera.totalSemestres || datosCarrera.totalSemesters || null,
      promedio: datosCarrera.promedio || datosCarrera.gpa || null,
      ramosAprobados: datosCarrera.ramosAprobados || datosCarrera.approvedCourses || null,
      ramosActuales: datosCarrera.ramosActuales || datosCarrera.currentCourses || null,
      estado: datosCarrera.estado || datosCarrera.status || 'activo'
    });

    const ramosAleatorios = seleccionarRamosAleatorios(baseDatos, carreraId, 5, ramosDisponibles);
    const cursos = ramosAleatorios.map((ramo, indice) => ({
      code: ramo.codigo || `SIM${indice + 1}`,
      name: ramo.nombre,
      level: ramo.nivel,
      credits: ramo.creditos || 5,
      status: 'planificado',
      priority: indice + 1
    }));

    const simulacion = crearRegistroSimulacion(baseDatos, {
      estudianteId,
      carreraId,
      titulo: carga.titulo || `Simulación rápida ${new Date().toLocaleDateString('es-CL')}`,
      periodoObjetivo: carga.periodoObjetivo || `Semestre ${new Date().getFullYear()}`,
      notas: 'Generada desde la vista Malla Actual',
      cursos
    });

    return res.status(201).json({
      mensaje: 'Simulación generada correctamente.',
      simulacion
    });
  } catch (error) {
    console.error('[simulaciones] error al generar simulación automática', error);
    return res.status(500).json({
      error: 'No fue posible generar la simulación solicitada.',
      detalle: error.message
    });
  }
});

enrutador.delete('/:id', (req, res) => {
  const baseDatos = req.db;
  const { id } = req.params;
  const resultado = baseDatos.prepare('DELETE FROM simulaciones WHERE id = ?').run(id);

  if (!resultado.changes) {
    return res.status(404).json({ error: 'Simulación no encontrada.' });
  }

  eliminarArchivoSimulacion(id);

  return res.json({ mensaje: 'Simulación eliminada correctamente.' });
});

module.exports = enrutador;
