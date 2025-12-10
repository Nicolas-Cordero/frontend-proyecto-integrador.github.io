(function() {
  'use strict';

  function procesarDatos(avanceData, mallaData) {
    if (!avanceData || !Array.isArray(avanceData)) {
      avanceData = [];
    }
    if (!mallaData || !Array.isArray(mallaData)) {
      mallaData = [];
    }

    const avanceOrdenado = avanceData.sort((a, b) => {
      const periodA = parseInt(a.period) || 0;
      const periodB = parseInt(b.period) || 0;
      return periodA - periodB;
    });

    const aprobados = avanceOrdenado.filter(item => (item.status || '').toUpperCase() === 'APROBADO');

    const codigosAprobados = new Set(aprobados.map(item => item.course));

    const pendientes = mallaData.filter(ramo => !codigosAprobados.has(ramo.codigo));
    const pendientesOrdenados = pendientes.sort((a, b) => a.nivel - b.nivel);

    return {
      ramosAprobados: aprobados,
      ramosPendientes: pendientesOrdenados,
      codigosAprobados: codigosAprobados
    };
  }

  window.procesarDatos = procesarDatos;

})();
