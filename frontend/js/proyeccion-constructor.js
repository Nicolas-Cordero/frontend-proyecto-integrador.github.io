(function() {
  'use strict';

  function crearProyeccion(ramosPendientes, ramosAprobados, creditosMaximos) {
    if (!Array.isArray(ramosPendientes)) ramosPendientes = [];
    if (!Array.isArray(ramosAprobados)) ramosAprobados = [];

    const semestres = [];
    const ramosPorProcesar = [...ramosPendientes];
    const ramosProcesados = new Set(ramosAprobados.map(r => r.course));

    let iteraciones = 0;
    const maxIteraciones = 20;

    while (ramosPorProcesar.length > 0 && iteraciones < maxIteraciones) {
      iteraciones++;
      const semestreActual = [];
      let creditosSemestreActual = 0;

      for (let i = 0; i < ramosPorProcesar.length; i++) {
        const ramo = ramosPorProcesar[i];

        const cumpleRequisitos = window.puedeAgregarRamo(ramo, ramosProcesados);
        const cabeEnCreditos = window.cabeEnSemestre(ramo, creditosSemestreActual, creditosMaximos);

        if (cumpleRequisitos && cabeEnCreditos) {
          semestreActual.push(ramo);
          creditosSemestreActual += (ramo.creditos || 0);
          ramosPorProcesar.splice(i, 1);
          i--;
        }
      }

      if (semestreActual.length === 0 && ramosPorProcesar.length > 0) {
        ramosPorProcesar.sort((a, b) => a.nivel - b.nivel);
        for (let i = 0; i < ramosPorProcesar.length; i++) {
          const ramo = ramosPorProcesar[i];
          if (window.puedeAgregarRamo(ramo, ramosProcesados)) {
            semestreActual.push(ramo);
            ramosPorProcesar.splice(i, 1);
            break;
          }
        }
      }

      semestreActual.forEach(r => ramosProcesados.add(r.codigo));

      if (semestreActual.length > 0) {
        semestres.push(semestreActual);
      } else {
        break;
      }
    }

    return {
      semestres: semestres,
      totalSemestres: semestres.length,
      totalRamos: semestres.flat().length,
      ramosReqNoPosibles: ramosPorProcesar
    };
  }

  window.crearProyeccion = crearProyeccion;

})();
