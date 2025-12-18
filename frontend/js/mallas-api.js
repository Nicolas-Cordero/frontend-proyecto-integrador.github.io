(function() {
  'use strict';
  
  const DEFAULT_MALLA = [
    { codigo: "DCCB-00106", asignatura: "CÁLCULO I", nivel: 1, creditos: 6, prereq: "" },
    { codigo: "DCCB-00107", asignatura: "ÁLGEBRA I", nivel: 1, creditos: 6, prereq: "" },
    { codigo: "DCCB-00204", asignatura: "PROGRAMACIÓN", nivel: 2, creditos: 8, prereq: "DCCB-00106,DCCB-00107" },
    { codigo: "DCCB-00304", asignatura: "PROGRAMACIÓN ORIENTADA A OBJETOS", nivel: 3, creditos: 8, prereq: "DCCB-00204" },
    { codigo: "DCCB-00402", asignatura: "BASES DE DATOS", nivel: 4, creditos: 8, prereq: "DCCB-00304" },
    { codigo: "UNFV-01001", asignatura: "FORMACIÓN GENERAL VALORICA 1", nivel: 1, creditos: 2, prereq: "" },
    { codigo: "UNFV-02002", asignatura: "FORMACIÓN GENERAL VALORICA 2", nivel: 2, creditos: 2, prereq: "" },
    { codigo: "DCCB-00119", asignatura: "INTRODUCCIÓN A LA FÍSICA", nivel: 1, creditos: 6, prereq: "" }
  ];

  async function obtenerMallas(codigoCarrera, semestre) {
    let url;
    
    if (typeof codigoCarrera === 'string' && codigoCarrera.startsWith('http')) {
      url = codigoCarrera;
    } else if (codigoCarrera) {
      if (semestre) {
        url = `http://localhost:3000/api/mallas?codigo=${encodeURIComponent(codigoCarrera)}&semestre=${encodeURIComponent(semestre)}`;
      } else {
        url = `http://localhost:3000/api/mallas?codigo=${encodeURIComponent(codigoCarrera)}`;
      }
    } else {
      url = window.APP_CONFIG?.API_URL || '/api/mallas';
    }
    
    console.log(`[mallas-api] URL construida: ${url}`);
    
    try {
      console.log(`[mallas-api] GET ${url}`);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        console.warn(`[mallas-api] Error HTTP ${res.status}, usando fallback`);
        return DEFAULT_MALLA;
      }

      const datos = await res.json();
      console.log(`[mallas-api] ✓ ${datos.length || 0} mallas obtenidas`);
      
      return datos;
      
    } catch (err) {
      console.warn(`[mallas-api] Error: ${err.message}, usando fallback`);
      return DEFAULT_MALLA;
    }
  }

  window.obtenerMallas = obtenerMallas;
  window.DEFAULT_MALLA = DEFAULT_MALLA;

})();
