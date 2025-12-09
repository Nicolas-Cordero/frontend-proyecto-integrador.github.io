/**
 * proxy-server.js
 * 
 * Proxy CORS que:
 * - Maneja restricciones CORS del navegador
 * - Añade header de autenticación X-HAWAII-AUTH
 * - Expone /api/mallas localmente en puerto 3000
 * 
 * Ejecutar: npm start
 */

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Credenciales de la API real
// Usamos una plantilla donde se reemplazarán los placeholders `codigo` y `semestre`.
// Ejemplo de plantilla: 'https://losvilos.ucn.cl/hawaii/api/mallas?codigo-semestre'
const API_URL_TEMPLATE = 'https://losvilos.ucn.cl/hawaii/api/mallas?codigo-semestre';
const AUTH_TOKEN = 'jf400fejof13f';

/**
 * Habilitar CORS para todas las rutas
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // Permitimos el header de autenticación que enviamos al backend remoto
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-HAWAII-AUTH');
  next();
});

/**
 * GET /api/mallas
 * 
 * Obtiene mallas desde API remota con autenticación
 * Responde con JSON de mallas o error
 */
app.get('/api/mallas', async (req, res) => {
  try {
    console.log('[proxy] GET /api/mallas - Iniciando...');
    const codigo = req.query.codigo
    const semestre = req.query.semestre

    // Reemplazar placeholders en la plantilla
    let remoteUrl = API_URL_TEMPLATE.replace('codigo', codigo).replace('semestre', semestre);
    // Si por alguna razón la plantilla no contiene placeholders, fallback al formato antiguo
    if (!remoteUrl.includes(codigo) && !remoteUrl.includes(semestre) && !remoteUrl.includes('-')) {
      remoteUrl = `${API_URL_TEMPLATE}?${codigo}-${semestre}`;
    }
    console.log(`[proxy] → Petición remota: ${remoteUrl}`);

    // Llamada a la API remota incluyendo el header de autenticación
    const response = await axios.get(remoteUrl, {
      headers: {
        'X-HAWAII-AUTH': AUTH_TOKEN,
      },
      // timeout opcional para no colgar la petición
      timeout: 10000,
    });

    console.log(`[proxy] ✓ API respondió: ${response.status}`);
    res.json(response.data);

  } catch (error) {
    console.error(`[proxy] ✗ Error: ${error.message}`);
    console.error('[proxy] Respuesta de error:', error.response?.status, error.response?.statusText);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[proxy] Escuchando en http://localhost:${PORT}`);
  console.log(`[proxy] Endpoint: GET http://localhost:${PORT}/api/mallas`);
});
