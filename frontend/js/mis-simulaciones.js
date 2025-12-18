(function() {
  'use strict';

  // Habilitar/deshabilitar botones según selección
  function actualizarEstadoBotones() {
    const select = document.getElementById('simulaciones');
    const btnBorrar = document.getElementById('borrarSimulacion');
    const btnVer = document.getElementById('iniciarFetch');
    const btnDescargar = document.getElementById('descargarSimulacion');
    
    const haySeleccion = select && select.value && select.value !== '';
    
    if (btnBorrar) btnBorrar.disabled = !haySeleccion;
    if (btnVer) btnVer.disabled = !haySeleccion;
    if (btnDescargar) btnDescargar.disabled = !haySeleccion;
  }

  async function descargarSimulacion() {
    const select = document.getElementById('simulaciones');
    const simulacionId = select.value;
    
    if (!simulacionId) {
      alert('Por favor selecciona una simulación para descargar');
      return;
    }

    try {
      const url = `http://localhost:4000/api/simulaciones/${simulacionId}/archivo`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al descargar la simulación');
      }

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `simulacion-${simulacionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Error al descargar simulación:', error);
      alert(`Error al descargar la simulación: ${error.message}`);
    }
  }

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

  async function borrarSimulacion() {
    const select = document.getElementById('simulaciones');
    const simulacionId = select.value;
    
    if (!simulacionId) {
      alert('Por favor selecciona una simulación para borrar');
      return;
    }

    const opcionSeleccionada = select.options[select.selectedIndex];
    const nombreSimulacion = opcionSeleccionada.text;

    // Confirmar antes de borrar
    if (!confirm(`¿Estás seguro de que deseas borrar la simulación "${nombreSimulacion}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/simulaciones/${simulacionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al borrar la simulación');
      }

      const result = await response.json();
      console.log('Simulación borrada:', result);

      // Mostrar mensaje de éxito
      alert('Simulación borrada correctamente');

      // Eliminar la opción del select
      select.remove(select.selectedIndex);

      // Limpiar la vista
      const contenedor = document.getElementById('contenedorMalla');
      if (contenedor) {
        contenedor.innerHTML = '<div class="empty">Selecciona una simulación en el panel para verla aquí.</div>';
      }

      const datosDiv = document.getElementById('Datos');
      if (datosDiv) {
        datosDiv.innerHTML = 'Sin selección';
      }

      // Actualizar estado de botones
      actualizarEstadoBotones();

      // Recargar la lista de simulaciones
      if (window.poblarSimulaciones) {
        await window.poblarSimulaciones();
      }

    } catch (error) {
      console.error('Error al borrar simulación:', error);
      alert(`Error al borrar la simulación: ${error.message}`);
    }
  }

  // Inicializar eventos cuando el DOM esté listo
  function inicializar() {
    const btnBorrar = document.getElementById('borrarSimulacion');
    const select = document.getElementById('simulaciones');
    const btnVer = document.getElementById('iniciarFetch');
    const btnDescargar = document.getElementById('descargarSimulacion');

    if (btnBorrar) {
      btnBorrar.addEventListener('click', borrarSimulacion);
    }

    if (btnDescargar) {
      btnDescargar.addEventListener('click', descargarSimulacion);
    }

    if (select) {
      select.addEventListener('change', actualizarEstadoBotones);
    }

    if (btnVer) {
      btnVer.addEventListener('click', fetchSimulacion);
    }

    // Estado inicial
    actualizarEstadoBotones();
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

  window.fetchSimulacion = fetchSimulacion;
  window.borrarSimulacion = borrarSimulacion;
  window.descargarSimulacion = descargarSimulacion;

})();