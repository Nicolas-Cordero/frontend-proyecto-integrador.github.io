async function prepararProyeccion(rut, codcarrera, semestre, creditosMaximos = 30) {
  try {
    const avanceData = await obtenerAvanceParaCarrera(rut, codcarrera);
    const mallaData = await obtenerMallas(codcarrera, semestre);
    const {ramosAprobados,ramosPendientes, codigosAprobados} = window.procesarDatos(avanceData,mallaData);

    const proyeccion = window.crearProyeccion(ramosPendientes, ramosAprobados, creditosMaximos);
    
    return proyeccion;
  } catch (error) {
    console.error(' Error en prepararProyeccion:', error.message);
    throw error;
  }
}

// Exportar globalmente
window.prepararProyeccion = prepararProyeccion;
