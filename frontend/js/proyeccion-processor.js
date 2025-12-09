function procesarDatos(avanceData, mallaData) {
  // Ordenar avance por periodo
  const avanceOrdenado = avanceData.sort((a, b) => a.period - b.period);

  // Filtrar solo aprobados
  const aprobados = avanceOrdenado.filter(item => (item.status || '').toUpperCase() === 'APROBADO');

  // Crear set de códigos aprobados
  const codigosAprobados = new Set(aprobados.map(item => item.course));

  // Filtrar pendientes y ordenar por nivel
  const pendientes = mallaData.filter(ramo => !codigosAprobados.has(ramo.codigo));
  const pendientesOrdenados = pendientes.sort((a, b) => a.nivel - b.nivel);

  return {
    ramosAprobados: aprobados,
    ramosPendientes: pendientesOrdenados,
    codigosAprobados: codigosAprobados
  };
}

window.procesarDatos = procesarDatos;
