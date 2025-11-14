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
const API_URL = 'https://losvilos.ucn.cl/hawaii/api/mallas?8606-202320';
const AUTH_TOKEN = 'jf400fejof13f';

/**
 * Habilitar CORS para todas las rutas
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    
    // Fetch con header de autenticación
    const response = await axios.get(API_URL, {
      headers: {
        'X-HAWAII-AUTH': AUTH_TOKEN
      }
    });

    console.log(`[proxy] ✓ API respondió: ${response.status}`);
    res.json(response.data);
    
  } catch (error) {
    console.error(`[proxy] ✗ Error: ${error.message}`);
    console.error('[proxy] Respuesta de error:', error.response?.status, error.response?.statusText);
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[proxy] Escuchando en http://localhost:${PORT}`);
  console.log(`[proxy] Endpoint: GET http://localhost:${PORT}/api/mallas`);
});
