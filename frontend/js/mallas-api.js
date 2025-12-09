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
 * @param {string} codigo - Código de carrera (ej: "8606")
 * @param {string} semestre - Semestre (ej: "202320")
 */
async function obtenerMallas(codigo, semestre) {
  // Construir la ruta al proxy local en puerto 3000, pasando codigo y semestre como query params
  const url = `http://localhost:3000/api/mallas?codigo=${encodeURIComponent(codigo)}&semestre=${encodeURIComponent(semestre)}`;
  
  try {
    console.log(`[mallas-api] GET ${url}`);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`[mallas-api] Error HTTP ${res.status}`);
      return null;
    }

    const datos = await res.json();
    console.log(`[mallas-api] ✓ ${datos.length || 0} mallas obtenidas`);

    return datos;
    
  } catch (err) {
    console.error(`[mallas-api] Error: ${err.message}`);
    return null;
  }
}

// Exportar globales
window.obtenerMallas = obtenerMallas;
window.DEFAULT_MALLA = DEFAULT_MALLA;
