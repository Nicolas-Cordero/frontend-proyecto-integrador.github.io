(function() {
  'use strict';
  async function fetchSimulacion() {
    const actual = document.getElementById("simulaciones");
    const response = await fetch(`http://localhost:4000/api/simulaciones/${actual.value}/archivo`);
    const malla = await response.json();
    console.log(malla);
    window.renderizarProyeccion(malla, 'contenedorMalla');
    const datosDiv = document.getElementById("Datos");
    datosDiv.innerHTML = `<strong>Fecha de creacion:</strong> ${malla.creadoEn}<br>
                          <strong>Rut:</strong> ${malla.parametros.rut}<br>
                          <strong>Codigo de Carrera:</strong> ${malla.parametros.codigoCarrera}<br>
                          <strong>Catalogo:</strong> ${malla.parametros.semestre}<br>
                          <strong>Creditos máximos:</strong> ${malla.parametros.creditosMaximos}`;
                          

  }
  window.fetchSimulacion = fetchSimulacion;

})();