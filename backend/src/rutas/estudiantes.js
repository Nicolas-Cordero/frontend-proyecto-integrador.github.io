const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const configuracion = require('../configuracion');

const enrutador = express.Router();

function asegurarDirectorioFotos() {
  if (!fs.existsSync(configuracion.directorioFotosPerfil)) {
    fs.mkdirSync(configuracion.directorioFotosPerfil, { recursive: true });
  }
}

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    asegurarDirectorioFotos();
    cb(null, configuracion.directorioFotosPerfil);
  },
  filename: (req, file, cb) => {
    const rut = req.params.rut;
    const extension = path.extname(file.originalname).toLowerCase();
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!extensionesPermitidas.includes(extension)) {
      return cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (jpg, png, gif, webp)'));
    }
    cb(null, `${rut}${extension}`);
  }
});

const upload = multer({
  storage: almacenamiento,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (jpg, png, gif, webp)'));
    }
  }
});

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

    // Obtener foto_perfil del usuario
    const usuario = baseDatos.prepare('SELECT foto_perfil FROM usuarios WHERE id = ?').get(usuarioId);

    return res.json({
      estudianteId: usuarioId,
      usuarioId,
      rut: carga.rut,
      email: carga.email || carga.correo || null,
      foto_perfil: usuario?.foto_perfil || null,
      carreras: carrerasProcesadas,
      mensaje: 'Datos del estudiante sincronizados correctamente.'
    });
  } catch (error) {
    console.error('[estudiantes] error al sincronizar', error);
    return res.status(500).json({ error: 'Error al sincronizar el estudiante.' });
  }
});

enrutador.post('/:rut/foto', upload.single('foto'), (req, res) => {
  const baseDatos = req.db;
  const { rut } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });
  }

  try {
    const usuario = baseDatos.prepare('SELECT id, foto_perfil FROM usuarios WHERE rut = ?').get(rut);
    if (!usuario) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    if (usuario.foto_perfil) {
      const rutaFotoAnterior = path.join(configuracion.directorioFotosPerfil, path.basename(usuario.foto_perfil));
      if (fs.existsSync(rutaFotoAnterior)) {
        try {
          fs.unlinkSync(rutaFotoAnterior);
        } catch (error) {
          console.warn('[estudiantes] No se pudo eliminar foto anterior:', error.message);
        }
      }
    }

    const nombreArchivo = req.file.filename;
    const rutaRelativa = `profile-pictures/${nombreArchivo}`;
    const marcaTiempo = new Date().toISOString();

    baseDatos
      .prepare('UPDATE usuarios SET foto_perfil = ?, actualizado_en = ? WHERE id = ?')
      .run(rutaRelativa, marcaTiempo, usuario.id);

    return res.json({
      mensaje: 'Foto de perfil actualizada correctamente.',
      foto_perfil: rutaRelativa
    });
  } catch (error) {
    console.error('[estudiantes] error al subir foto', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: 'Error al subir la foto de perfil.' });
  }
});

enrutador.get('/:rut/foto', (req, res) => {
  const baseDatos = req.db;
  const { rut } = req.params;

  try {
    const usuario = baseDatos.prepare('SELECT foto_perfil FROM usuarios WHERE rut = ?').get(rut);
    if (!usuario || !usuario.foto_perfil) {
      return res.status(404).json({ error: 'Foto de perfil no encontrada.' });
    }

    const rutaFoto = path.join(configuracion.directorioFotosPerfil, path.basename(usuario.foto_perfil));
    if (!fs.existsSync(rutaFoto)) {
      return res.status(404).json({ error: 'Archivo de foto no encontrado.' });
    }

    const extension = path.extname(rutaFoto).toLowerCase();
    const tiposMime = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    const contentType = tiposMime[extension] || 'image/jpeg';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', contentType);

    return res.sendFile(path.resolve(rutaFoto));
  } catch (error) {
    console.error('[estudiantes] error al obtener foto', error);
    return res.status(500).json({ error: 'Error al obtener la foto de perfil.' });
  }
});

enrutador.get('/:identificador', (req, res) => {
  const baseDatos = req.db;
  const { identificador } = req.params;
  let usuario;

  if (/^\d+$/.test(identificador)) {
    const posibleId = Number(identificador);
    usuario = baseDatos.prepare('SELECT id, rut, email, foto_perfil FROM usuarios WHERE id = ?').get(posibleId);
    if (!usuario) {
      usuario = baseDatos.prepare('SELECT id, rut, email, foto_perfil FROM usuarios WHERE rut = ?').get(identificador);
    }
  } else {
    usuario = baseDatos.prepare('SELECT id, rut, email, foto_perfil FROM usuarios WHERE rut = ?').get(identificador);
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

  return res.json({ 
    estudiante: { 
      id: usuario.id, 
      rut: usuario.rut, 
      correo: usuario.email,
      foto_perfil: usuario.foto_perfil || null
    }, 
    carreras 
  });
});

module.exports = enrutador;
