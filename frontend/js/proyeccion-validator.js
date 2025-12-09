function puedeAgregarRamo(ramo, ramosProcesados) {
  // Si no tiene prerequisitos, se puede agregar
  if (!ramo.prereq || ramo.prereq.trim() === '') {
    console.log('Ramo sin prerequisitos:', ramo.codigo);
    return true;
  }

  // Parsear los prerequisitos (formato "CODIGO1,CODIGO2,...")
  const prereqs = ramo.prereq.split(',').map(p => p.trim());

  // Verificar que todos los prerequisitos estén en ramos procesados o en semestre actual
  for (let i = 0; i < prereqs.length; i++) {
    if (!ramosProcesados.has(prereqs[i])) {
      console.log('Falta prerequisito:', prereqs[i], 'para ramo:', ramo.codigo);
      return false;
    }
  }
  return true;
}

function cabeEnSemestre(ramo, creditosActuales, creditosMaximos) {
  return creditosActuales + ramo.creditos <= creditosMaximos;
}

// Exportar globalmente
window.puedeAgregarRamo = puedeAgregarRamo;
window.cabeEnSemestre = cabeEnSemestre;
