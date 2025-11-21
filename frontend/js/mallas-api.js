/**
 * mallas-api.js
 * 
 * Responsabilidad: Obtener datos de mallas desde el proxy
 * 
 * Expone:
 * - obtenerMallas(url): Fetch a API, retorna array o null
 * - DEFAULT_MALLA: Datos de fallback
 */

// IIFE para permitir re-inyecciones sin conflicto
(function() {
  'use strict';
  
  // Datos de fallback si la API falla
  const DEFAULT_MALLA = [
    { codigo: "DCCB-00106", asignatura: "CÁLCULO I", nivel: 1 },
    { codigo: "DCCB-00107", asignatura: "ÁLGEBRA I", nivel: 1 },
    { codigo: "DCCB-00204", asignatura: "PROGRAMACIÓN", nivel: 2 },
    { codigo: "DCCB-00304", asignatura: "PROGRAMACIÓN ORIENTADA A OBJETOS", nivel: 3 },
    { codigo: "DCCB-00402", asignatura: "BASES DE DATOS", nivel: 4 }
  ];

  /**
   * Obtiene mallas desde el proxy
   * 
   * @param {string} url - URL del endpoint (default: http://localhost:3000/api/mallas)
   * @returns {Promise<Array|null>} - Array de mallas o null si hay error
   */
  async function obtenerMallas(url) {
    // Usar URL pasada, config global, o default
    url = url || window.APP_CONFIG?.API_URL || '/api/mallas';
    
    try {
      
      const res = await fetch(url);
      
      if (!res.ok) {
        console.error(`[mallas-api] Error HTTP ${res.status}`);
        return null;
      }

      const datos = await res.json();
      
      return datos;
      
    } catch (err) {
      console.error(`[mallas-api] Error: ${err.message}`);
      return null;
    }
  }

  // Exportar globales
  window.obtenerMallas = obtenerMallas;
  window.DEFAULT_MALLA = DEFAULT_MALLA;

})(); // Cierre del IIFE
