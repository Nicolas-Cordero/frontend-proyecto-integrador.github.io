function crearProyeccion(ramosPendientes, ramosAprobados, creditosMaximos = 30) {
  const semestres = [];
  const ramosPorProcesar = [...ramosPendientes];
  const ramosProcesados = new Set(ramosAprobados.map(r => r.course));

  while (ramosPorProcesar.length > 0) {
    const semestreActual = [];
    let creditosSemestreActual = 0;

    console.log('Iniciando semestre', semestres.length + 1);

    // Intentar agregar ramos al semestre actual, priorizando por nivel
    for (let i = 0; i < ramosPorProcesar.length; i++) {
      const ramo = ramosPorProcesar[i];
      console.log('Evaluando ramo:', ramo.codigo, 'Nivel:', ramo.nivel);

      const cumpleRequisitos = window.puedeAgregarRamo(ramo, ramosProcesados);
      const cabeEnCreditos = window.cabeEnSemestre(ramo, creditosSemestreActual, creditosMaximos);

      if (cumpleRequisitos && cabeEnCreditos) {
        semestreActual.push(ramo);
        creditosSemestreActual += ramo.creditos;
        ramosPorProcesar.splice(i, 1);
        i--;
      }
    }

    // Si no se agregó ningún ramo, agregar el de menor nivel disponible (forzar progreso)
    if (semestreActual.length === 0 && ramosPorProcesar.length > 0) {
      ramosPorProcesar.sort((a, b) => a.nivel - b.nivel);
      for (let i = 0; i < ramosPorProcesar.length; i++) {
        const ramo = ramosPorProcesar[i];
        if (window.puedeAgregarRamo(ramo, ramosProcesados, semestreActual)) {
          semestreActual.push(ramo);
          ramosPorProcesar.splice(i, 1);
          break;
        }
      }
    }

    // Agregar ramos procesados en este semestre al conjunto
    semestreActual.forEach(r => ramosProcesados.add(r.codigo));

    // Agregar semestre a la proyección
    if (semestreActual.length > 0) {
      semestres.push(semestreActual);
    } else {
      console.warn('Advertencia: Ramos con prerequisitos no satisfacibles:', ramosPorProcesar);
      break;
    }
  }

  // Retornar estructura JSON
  return {
    semestres: semestres,
    totalSemestres: semestres.length,
    totalRamos: semestres.flat().length,
    ramosReqNoPosibles: ramosPorProcesar
  };
}

// Exportar globalmente
window.crearProyeccion = crearProyeccion;