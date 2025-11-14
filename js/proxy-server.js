/**
 * proxy-server.js
 * 
 * Proxy CORS que:
 * - Maneja restricciones CORS del navegador
 * - Añade header de autenticación X-HAWAII-AUTH
 * - Expone /api/mallas localmente en puerto 3000
 * - Sirve archivos estáticos (HTML, CSS, JS, images)
 * 
 * Ejecutar: npm start
 */

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Credenciales de la API real
const API_URL = 'https://losvilos.ucn.cl/hawaii/api/mallas?8606-202320';
const AUTH_TOKEN = 'jf400fejof13f';

/**
 * Servir archivos estáticos desde la raíz del proyecto
 * Esto permite acceder a /html/index.html, /css/*, /js/*, /images/*
 */
const projectRoot = path.join(__dirname, '..');
console.log(`[proxy] Sirviendo archivos desde: ${projectRoot}`);
app.use(express.static(projectRoot));

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
  console.log('\n' + '='.repeat(70));
  console.log('[proxy] ✓ SERVIDOR PROXY INICIADO CORRECTAMENTE');
  console.log('='.repeat(70));
  console.log(`[proxy] Escuchando en: http://localhost:${PORT}`);
  console.log(`[proxy] Sirviendo archivos desde: ${projectRoot}`);
  console.log('\n[proxy] URLs disponibles:');
  console.log(`  • Aplicación:  http://localhost:${PORT}/html/index.html`);
  console.log(`  • API Proxy:   http://localhost:${PORT}/api/mallas`);
  console.log('\n[proxy] Presiona Ctrl+C para detener el servidor\n');
  console.log('='.repeat(70) + '\n');
});
