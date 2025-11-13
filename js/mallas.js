/**
 * mallas.js
 * 
 * Responsabilidad: Orquestador principal
 * 
 * Flujo:
 * 1. Obtiene datos desde mallas-api.js
 * 2. Si falla, usa DEFAULT_MALLA como fallback
 * 3. Renderiza con mallas-ui.js
 */

/**
 * Inicializa la malla
 */
async function inicializarMallas(urlApi) {
  console.log('[mallas] Inicializando...');

  // 1. Obtener datos desde API (o proxy)
  let datos = await window.obtenerMallas(urlApi);

  // 2. Fallback a datos por defecto si falla
  if (!datos) {
    console.warn('[mallas] Usando datos por defecto');
    datos = window.DEFAULT_MALLA;
  }

  // 3. Renderizar en la página
  window.renderizarMalla(datos);
}

// Ejecutar cuando DOM esté listo O inmediatamente si ya está cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    inicializarMallas();
  });
} else {
  // DOM ya está listo (scripts cargados dinámicamente)
  inicializarMallas();
}

