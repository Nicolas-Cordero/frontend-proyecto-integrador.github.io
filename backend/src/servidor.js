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

const aplicacion = express();
const baseDatos = inicializarBaseDatos();

aplicacion.disable('x-powered-by');
aplicacion.use(helmet());
aplicacion.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

aplicacion.use(cors({ origin: configuracion.origenCors }));
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

aplicacion.listen(configuracion.puerto, () => {
  console.log(`Backend de simulaciones escuchando en http://localhost:${configuracion.puerto}`);
});
