(function() {
  'use strict';

  async function prepararProyeccion(rut, codcarrera, semestre, creditosMaximos = 30) {
    try {
      const avanceData = await window.obtenerAvanceParaCarrera(rut, codcarrera);
      const mallaData = await window.obtenerMallas(codcarrera, semestre);
      const mallaLimpia = window.limpiarMalla(mallaData);
      const { ramosAprobados, ramosPendientes} = window.procesarDatos(avanceData, mallaLimpia);

      const proyeccion = window.crearProyeccion(ramosPendientes, ramosAprobados, creditosMaximos);
      
      return proyeccion;
    } catch (error) {
      console.error('Error en prepararProyeccion:', error.message);
      throw error;
    }
  }

  window.prepararProyeccion = prepararProyeccion;

})();
