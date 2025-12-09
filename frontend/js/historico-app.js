/**
 * historico-app.js
 * 
 * Responsabilidad: Orquestador principal
 * Integra HistoricoAPI y HistoricoRender para proporcionar la lógica de la app
 */

/**
 * Inicializa el componente de histórico
 * @param {string} containerId - ID del contenedor
 * @returns {Object} Objeto con métodos para gestionar el histórico
 */
function crearHistoricoApp(containerId = 'contenedorColumnas') {
  const contenedor = document.getElementById(containerId);
  if (!contenedor) {
    console.error('HistoricoApp: contenedor con ID', containerId, 'no encontrado');
  }

  /**
   * Renderiza el estado inicial
   */
  function renderizarEstadoInicial() {
    if (window.renderizarEstadoInicial) {
      window.renderizarEstadoInicial(contenedor);
    }
  }

  /**
   * Carga datos desde la sesión del usuario y la API, luego renderiza
   */
  async function cargarDesdeSesion() {
    if (!window.obtenerUsuarioDeSesion || !window.obtenerTodosLosAvances || !window.renderizarMensaje) {
      throw new Error('Funciones de API no están disponibles');
    }

    const usuario = window.obtenerUsuarioDeSesion();
    if (!usuario) {
      window.renderizarMensaje(
        contenedor,
        'fa-user-circle',
        'No has iniciado sesión',
        'Por favor inicia sesión para ver tu histórico de avance.'
      );
      throw new Error('No hay sesión de usuario');
    }

    const rut = window.obtenerRutDeSesion();
    const carreras = window.obtenerCarrerasDeSesion();

    if (!rut || !Array.isArray(carreras) || carreras.length === 0) {
      window.renderizarMensaje(
        contenedor,
        'fa-exclamation-circle',
        'No hay carreras asociadas a la sesión',
        'Verifica tu cuenta o contacta soporte.'
      );
      throw new Error('Sesión sin carreras');
    }

    // Obtener todos los avances
    const avances = await window.obtenerTodosLosAvances();

    if (avances.length === 0) {
      renderizarEstadoInicial();
      throw new Error('No se obtuvieron registros de avance');
    }

    // Renderizar
    renderizarDatos(avances);
  }

  /**
   * Renderiza datos
   * @param {Array} datos - Array de registros
   */
  function renderizarDatos(datos) {
    if (window.renderizarDatos) {
      window.renderizarDatos(contenedor, datos);
    }
  }

  /**
   * Carga datos desde JSON (para pruebas)
   * @param {Array|string} rutaODatos - Array de datos o ruta a JSON
   */
  async function cargarDesdeDatos(rutaODatos) {
    if (Array.isArray(rutaODatos)) {
      renderizarDatos(rutaODatos);
      return;
    }

    try {
      const resp = await fetch(rutaODatos);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const datos = await resp.json();
      console.log('Datos cargados desde JSON:', datos);
      renderizarDatos(datos);
    } catch (err) {
      console.error('HistoricoApp: error cargando JSON:', err);
      renderizarEstadoInicial();
    }
  }

  // Inicializar
  console.log('HistoricoApp inicializado');
  renderizarEstadoInicial();
  cargarDesdeSesion().catch(err => {
    console.warn('HistoricoApp: no se pudieron obtener datos desde la API:', err);
  });

  // Retornar API pública
  return {
    cargarDesdeSesion,
    renderizarDatos,
    cargarDesdeDatos,
    renderizarEstadoInicial,
    contenedor
  };
}

// Inicialización automática cuando el DOM esté listo
function _initHistoricoApp() {
  if (!window.historicoApp) {
    window.historicoApp = crearHistoricoApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initHistoricoApp);
} else {
  _initHistoricoApp();
}

// Exportar globalmente
window.crearHistoricoApp = crearHistoricoApp;
