(function () {
  'use strict';

  async function poblarSimulaciones() {
    const userData = JSON.parse(sessionStorage.getItem('ucn_user_data'));
    const rut = userData ? userData.rut : '222222222';
    const selectSimulacion = document.getElementById("simulaciones");

    const response = await fetch(`http://localhost:4000/api/simulaciones/estudiante/${rut}?tipo=simulacion_egreso`);
    const simulaciones = await response.json();
    console.log(simulaciones);

    simulaciones.forEach(simulacion => {
      const optionElement = document.createElement('option');
      optionElement.value = simulacion.id;
      optionElement.textContent = simulacion.titulo;
      selectSimulacion.appendChild(optionElement);
    });
  }

  window.renderizarMalla = poblarSimulaciones;
  document.addEventListener('DOMContentLoaded', () => {
    poblarSimulaciones();
  });
})();
