(function () {
  'use strict';

  async function poblarSimulaciones() {
    const userData = JSON.parse(sessionStorage.getItem('ucn_user_data'));
    const rut = userData ? userData.rut : '222222222';
    const selectSimulacion = document.getElementById("simulaciones");

    const response = await fetch(`http://localhost:4000/api/simulaciones/estudiante/${rut}`);
    const simulaciones = await response.json();
    console.log(simulaciones);

    simulaciones.forEach(simulacion => {
      const optionElement = document.createElement('option');
      optionElement.value = simulacion.id;
      optionElement.textContent = simulacion.titulo;
      optionElement.dataset.tipo = simulacion.tipo;
      selectSimulacion.appendChild(optionElement);
    });
  }

  window.poblarSimulaciones = poblarSimulaciones;
})();