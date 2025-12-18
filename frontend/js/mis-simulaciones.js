(function() {
  'use strict';
  async function fetchSimulacion() {
    const actual = document.getElementById("simulaciones");
    const response = await fetch(`http://localhost:4000/api/simulaciones/${actual.value}/archivo`);
    const malla = await response.json();
    console.log(malla);

    if(malla.tipo == 'simulacion_siguiente_semestre'){
      let temp = {semestres: [[]]};
      for (const curso of malla.cursos) {
        temp.semestres[0].push({
          codigo: curso.codigo,
          asignatura: curso.nombre,
          creditos: curso.creditos,
          nivel: curso.nivel,
          prereq: '',
        })
      }
      console.log(temp);
      window.renderizarProyeccion(temp, 'contenedorMalla');
    } else {window.renderizarProyeccion(malla, 'contenedorMalla');}
    
    const datosDiv = document.getElementById("Datos");
    datosDiv.innerHTML = `<strong>Fecha de creacion:</strong> ${malla.creadoEn}<br>
                          <strong>Rut:</strong> ${malla.estudiante.rut}<br>
                          <strong>Carrera:</strong> ${malla.carrera.nombre}<br>
                          <strong>Codigo de Carrera:</strong> ${malla.carrera.codigo}<br>
                          <strong>Catalogo:</strong> ${malla.carrera.catalogo}<br>`;
       

  }
  window.fetchSimulacion = fetchSimulacion;

})();