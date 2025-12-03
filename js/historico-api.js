/**
 * historico-api.js
 * 
 * Responsabilidad: Obtener datos de avance desde la API y la sesión del usuario
 * Expone funciones para recuperar carreras y avances
 */

/**
 * Obtiene datos del usuario desde sessionStorage
 * @returns {Object} Objeto usuario o null si no existe sesión
 */
function obtenerUsuarioDeSesion() {
  const raw = sessionStorage.getItem('ucn_user_data');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('HistoricoAPI: error parseando sessionStorage:', err);
    return null;
  }
}

/**
 * Obtiene el RUT del usuario desde sesión
 * @returns {string|null} RUT o null
 */
function obtenerRutDeSesion() {
  const usuario = obtenerUsuarioDeSesion();
  if (!usuario) return null;
  return usuario.rut || (usuario.user && usuario.user.rut) || null;
}

/**
 * Obtiene las carreras del usuario desde sesión
 * @returns {Array} Array de carreras o array vacío
 */
function obtenerCarrerasDeSesion() {
  const usuario = obtenerUsuarioDeSesion();
  if (!usuario) return [];
  return usuario.carreras || (usuario.user && usuario.user.carreras) || [];
}

/**
 * Obtiene todos los avances del usuario (todas sus carreras)
 * Requiere que obtenerAvanceParaCarrera esté disponible
 * @returns {Array} Array concatenado de todos los avances
 */
async function obtenerTodosLosAvances() {
  if (!window.obtenerAvanceParaCarrera) {
    throw new Error('obtenerAvanceParaCarrera no está disponible. Asegúrate de cargar historico-avance-api.js');
  }

  const rut = obtenerRutDeSesion();
  const carreras = obtenerCarrerasDeSesion();

  if (!rut || !Array.isArray(carreras) || carreras.length === 0) {
    throw new Error('No hay sesión de usuario o no tiene carreras asociadas');
  }

  const todas = [];
  for (const c of carreras) {
    const codigo = c.codigo || c.code || c.cod || null;
    if (!codigo) continue;
    try {
      const avance = await window.obtenerAvanceParaCarrera(rut, codigo);
      if (Array.isArray(avance) && avance.length > 0) {
        todas.push(...avance);
      }
    } catch (err) {
      console.warn('HistoricoAPI: fallo al cargar avance para', codigo, err.message || err);
      // Continuar con las demás carreras
    }
  }

  return todas;
}

// Exportar globalmente
window.obtenerUsuarioDeSesion = obtenerUsuarioDeSesion;
window.obtenerRutDeSesion = obtenerRutDeSesion;
window.obtenerCarrerasDeSesion = obtenerCarrerasDeSesion;
window.obtenerTodosLosAvances = obtenerTodosLosAvances;
