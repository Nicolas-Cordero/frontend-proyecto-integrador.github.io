(function () {
  'use strict';

  async function poblarSimulaciones(tipoFiltro = null) {
    const userData = JSON.parse(sessionStorage.getItem('ucn_user_data'));
    const rut = userData ? userData.rut : '222222222';
    const selectSimulacion = document.getElementById("simulaciones");

    // Limpiar opciones existentes excepto la primera (placeholder)
    while (selectSimulacion.options.length > 1) {
      selectSimulacion.remove(1);
    }

    let url = `http://localhost:4000/api/simulaciones/estudiante/${rut}`;
    if (tipoFiltro) {
      url += `?tipo=${encodeURIComponent(tipoFiltro)}`;
    }

    const response = await fetch(url);
    const simulaciones = await response.json();

    simulaciones.forEach(simulacion => {
      const optionElement = document.createElement('option');
      optionElement.value = simulacion.id;
      optionElement.textContent = simulacion.titulo;
      optionElement.dataset.tipo = simulacion.tipo;
      selectSimulacion.appendChild(optionElement);
    });
  }

  async function poblarSimulacionesEgreso() {
    return poblarSimulaciones('simulacion_egreso');
  }

  async function poblarSimulacionesProxSemestre() {
    return poblarSimulaciones('simulacion_siguiente_semestre');
  }

  window.poblarSimulaciones = poblarSimulaciones;
  window.poblarSimulacionesEgreso = poblarSimulacionesEgreso;
  window.poblarSimulacionesProxSemestre = poblarSimulacionesProxSemestre;
})();