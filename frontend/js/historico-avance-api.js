(function() {
  'use strict';

  const DATOS_FALLBACK_AVANCE = [
    { course: "DCCB-00106", status: "APROBADO", period: 202310 },
    { course: "DCCB-00107", status: "APROBADO", period: 202310 },
    { course: "DCCB-00204", status: "APROBADO", period: 202320 },
    { course: "DCCB-00304", status: "APROBADO", period: 202330 }
  ];

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
        console.warn('HistoricoAvanceAPI: API respondió con error, usando fallback');
        return DATOS_FALLBACK_AVANCE;
      }
      return DATOS_FALLBACK_AVANCE;
    } catch (err) {
      console.warn('HistoricoAvanceAPI: error obteniendo avance, usando fallback');
      return DATOS_FALLBACK_AVANCE;
    }
  }

  window.fetchJsonText = fetchJsonText;
  window.obtenerAvanceParaCarrera = obtenerAvanceParaCarrera;
  window.DATOS_FALLBACK_AVANCE = DATOS_FALLBACK_AVANCE;

})();
