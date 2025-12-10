(function() {
  'use strict';

  function puedeAgregarRamo(ramo, ramosProcesados) {
    if (!ramo) return false;
    
    if (!ramo.prereq || ramo.prereq.trim() === '') {
      return true;
    }

    const prereqs = ramo.prereq.split(',').map(p => p.trim()).filter(p => p);

    for (let i = 0; i < prereqs.length; i++) {
      if (!ramosProcesados.has(prereqs[i])) {
        return false;
      }
    }
    return true;
  }

  function cabeEnSemestre(ramo, creditosActuales, creditosMaximos) {
    if (!ramo || !ramo.creditos) return false;
    return creditosActuales + ramo.creditos <= creditosMaximos;
  }

  window.puedeAgregarRamo = puedeAgregarRamo;
  window.cabeEnSemestre = cabeEnSemestre;

})();
