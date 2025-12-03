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

  const userData = JSON.parse(sessionStorage.getItem('ucn_user_data'));
  const carreras = userData?.carreras || [];

  // 1. Obtener datos desde API (o proxy)
  let datos = await window.obtenerMallas(carreras[0].codigo, carreras[0].catalogo);

  // 2. Fallback a datos por defecto si falla
  if (!datos) {
    console.warn('[mallas] Usando datos por defecto');
    datos = window.DEFAULT_MALLA;
  }

  // 3. Renderizar en la página
  window.renderizarMalla(datos);
  window.crearSelect
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

