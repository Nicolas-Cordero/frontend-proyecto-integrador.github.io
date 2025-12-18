const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const configuracion = require('./configuracion');
const { inicializarBaseDatos } = require('./base-datos');
const rutasEstudiantes = require('./rutas/estudiantes');
const rutasCursos = require('./rutas/cursos');
const rutasSimulaciones = require('./rutas/simulaciones');
const fs = require('fs');

const aplicacion = express();
const baseDatos = inicializarBaseDatos();

if (!fs.existsSync(configuracion.directorioFotosPerfil)) {
  fs.mkdirSync(configuracion.directorioFotosPerfil, { recursive: true });
}

aplicacion.disable('x-powered-by');
aplicacion.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
aplicacion.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

aplicacion.use(cors({ 
  origin: configuracion.origenCors,
  credentials: false
}));
aplicacion.use(express.json({ limit: '2mb' }));
aplicacion.use(morgan('dev'));

aplicacion.use((req, res, next) => {
  req.db = baseDatos;
  next();
});

aplicacion.get(['/api/salud', '/api/health'], (req, res) => {
  res.json({
    estado: 'ok',
    baseDatos: configuracion.archivoBaseDatos,
    marcaTiempo: new Date().toISOString()
  });
});

aplicacion.use('/api/estudiantes', rutasEstudiantes);
aplicacion.use('/api/students', rutasEstudiantes);
aplicacion.use('/api', rutasCursos);
aplicacion.use('/api/simulaciones', rutasSimulaciones);
aplicacion.use('/api/simulations', rutasSimulaciones);

aplicacion.use((error, req, res, next) => {
  console.error('[backend] error inesperado', error);
  res.status(500).json({ error: 'Error interno en el backend.' });
});

const servidor = aplicacion.listen(configuracion.puerto, () => {
  console.warn(`Backend de simulaciones escuchando en http://localhost:${configuracion.puerto}`);
});

servidor.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(`El puerto ${configuracion.puerto} ya está en uso.`);
    console.error('Cierra el proceso que está usando ese puerto o inicia el backend con otro puerto:');
    console.error(`BACKEND_PORT=4001 npm start`);
    process.exitCode = 1;
    return;
  }
  console.error('Error al iniciar el servidor:', error);
  process.exitCode = 1;
});
