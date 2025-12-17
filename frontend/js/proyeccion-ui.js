/*
 * proyeccion-ui.js
 */

(function () {
  'use strict';

  function crearNodoRamo(ramo) {
  const div = document.createElement('div');
  div.classList.add('ramo');

  const codigo = ramo.codigo || ramo.code || '---';
  const nombre = ramo.asignatura || ramo.nombre || 'Sin nombre';
  const creditos = ramo.creditos != null ? ` (${ramo.creditos}cr)` : '';
  const prereq = ramo.prereq ? `Requisitos: ${ramo.prereq}` : '';

  div.innerHTML = `
    <div class="titulo-ramo">${nombre}</div>
    <div class="meta-ramo">${codigo}${creditos}${prereq ? ' • ' + prereq : ''}</div>
  `;

  /* 🔧 FORZAR COLOR DE TEXTO */
  div.style.color = '#0f172a';           // texto principal
  div.style.background = '#ffffff';

  const titulo = div.querySelector('.titulo-ramo');
  const meta = div.querySelector('.meta-ramo');

  titulo.style.color = '#020617';         // casi negro
  titulo.style.fontWeight = '600';

  meta.style.color = '#475569';           // gris legible
  meta.style.fontSize = '0.85rem';

  div.style.padding = '0.4rem 0.6rem';
  div.style.borderRadius = '6px';
  div.style.border = '1px solid rgba(11,34,56,0.04)';
  div.style.boxShadow = '0 1px 4px rgba(2,6,23,0.03)';

  return div;
}


  function renderizarProyeccion(proyeccion, containerId) {
    const id = containerId || 'contenedorMalla';
    const contenedor = document.getElementById(id);
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (!proyeccion || !Array.isArray(proyeccion.semestres)) {
      contenedor.innerHTML = `<div class="mensaje">No hay datos de proyecciones</div>`;
      return;
    }

    /* =====================
       RAMOS NORMALES (ARRIBA)
       ===================== */

    const wrapper = document.createElement('div');
    wrapper.classList.add('hscroll-wrap');
    wrapper.style.overflowX = 'auto';
    wrapper.style.paddingBottom = '.8rem';

    const columnas = document.createElement('div');
    columnas.classList.add('columnas');
    columnas.style.display = 'flex';
    columnas.style.gap = '1rem';
    columnas.style.flexWrap = 'nowrap';
    columnas.style.alignItems = 'flex-start';

    wrapper.appendChild(columnas);
    contenedor.appendChild(wrapper);

    proyeccion.semestres.forEach((semestre, index) => {
      const columna = document.createElement('div');
      columna.classList.add('columna');
      columna.style.flex = '0 0 auto';
      columna.style.minWidth = '260px';
      columna.style.maxWidth = '360px';
      columna.style.display = 'flex';
      columna.style.flexDirection = 'column';
      columna.style.gap = '.5rem';

      columna.innerHTML = `
        <div class="titulo-col">SEMESTRE ${index + 1}</div>
        <div class="cuerpo-col"></div>
      `;

      const cuerpo = columna.querySelector('.cuerpo-col');
      cuerpo.style.display = 'flex';
      cuerpo.style.flexDirection = 'column';
      cuerpo.style.gap = '.4rem';

      if (Array.isArray(semestre) && semestre.length) {
        semestre.forEach(ramo => cuerpo.appendChild(crearNodoRamo(ramo)));
      } else {
        const empty = document.createElement('div');
        empty.textContent = 'Sin ramos';
        empty.classList.add('sin-ramos');
        cuerpo.appendChild(empty);
      }

      columnas.appendChild(columna);
    });

    /* ==========================
       RAMOS NO POSIBLES (ABAJO)
       ========================== */

    if (Array.isArray(proyeccion.ramosReqNoPosibles) && proyeccion.ramosReqNoPosibles.length) {
      const section = document.createElement('section');
      section.classList.add('ramos-no-posibles');
      section.style.marginTop = '1.5rem';

      section.innerHTML = `
        <h3 style="margin-bottom:.6rem">
          Ramos no posibles (${proyeccion.ramosReqNoPosibles.length})
        </h3>
      `;

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridAutoFlow = 'column';
      grid.style.gridTemplateRows = 'repeat(5, auto)';
      grid.style.gap = '.5rem 1rem';
      grid.style.alignItems = 'start';
      grid.style.overflowX = 'auto';
      grid.style.paddingBottom = '.5rem';

      proyeccion.ramosReqNoPosibles.forEach(ramo => {
        const nodo = crearNodoRamo(ramo);
        nodo.classList.add('no-posible');
        grid.appendChild(nodo);
      });

      section.appendChild(grid);
      contenedor.appendChild(section);
    }
  }

  window.renderizarProyeccion = renderizarProyeccion;
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderizarProyeccion };
}
