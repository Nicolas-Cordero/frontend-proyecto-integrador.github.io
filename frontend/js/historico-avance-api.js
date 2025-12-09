async function fetchJsonText(url, options = {}) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Respuesta inválida JSON desde ${url}: ${text}`);
  }
}

async function obtenerAvanceParaCarrera(rut, codcarrera) {
  const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codcarrera)}`;
  try {
    const datos = await fetchJsonText(url);
    if (Array.isArray(datos)) return datos;
    if (datos && datos.error) {
      console.warn('HistoricoAvanceAPI: API respondió con error para', codcarrera, datos.error);
      return [];
    }
    return [];
  } catch (err) {
    console.error('HistoricoAvanceAPI: error obteniendo avance para', codcarrera, err);
    throw err;
  }
}

// Exportar globalmente
window.fetchJsonText = fetchJsonText;
window.obtenerAvanceParaCarrera = obtenerAvanceParaCarrera;
