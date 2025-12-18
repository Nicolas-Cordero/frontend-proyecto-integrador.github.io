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
const API_BASE_URL = 'https://losvilos.ucn.cl/hawaii/api/mallas';
const AUTH_TOKEN = 'jf400fejof13f';

/**
 * Servir archivos estáticos desde la raíz del proyecto
 * Esto permite acceder a /html/index.html, /css/*, /js/*, /images/*
 */
const projectRoot = path.join(__dirname, '..');
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
 * GET /favicon.ico
 * 
 * Sirve el favicon desde la carpeta de imágenes
 */
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(projectRoot, 'images', 'favicon.png'));
});

/**
 * GET /api/mallas
 * 
 * Obtiene mallas desde API remota con autenticación
 * Responde con JSON de mallas o error
 * 
 * Parámetros de query:
 * - codigo: Código de la carrera (ej: 8266, 8616)
 * - semestre: Semestre (opcional, ej: 202320)
 */
app.get('/api/mallas', async (req, res) => {
  try {
    const { codigo, semestre } = req.query;
    
    let url = API_BASE_URL;
    const semestreFinal = semestre || '202320';
    
    if (codigo) {
      url = `${API_BASE_URL}?${codigo}-${semestreFinal}`;
    } else {
      url = `${API_BASE_URL}?8606-202320`;
    }
    
    const response = await axios.get(url, {
      headers: {
        'X-HAWAII-AUTH': AUTH_TOKEN
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    const dataLength = Array.isArray(response.data) ? response.data.length : 0;
    
    if (dataLength === 0) {
      console.warn(`[proxy] ⚠ ADVERTENCIA: La API devolvió 0 mallas para código ${codigo || 'default'}`);
    }
    
    res.json(response.data);
    
  } catch (error) {
    console.error(`[proxy] ✗ Error: ${error.message}`);
    console.error('[proxy] Respuesta de error:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('[proxy] Datos de error:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(error.response?.status || 500).json({ 
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.warn(`[proxy] Servidor iniciado en http://localhost:${PORT}`);
});
