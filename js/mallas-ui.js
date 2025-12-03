/**
 * mallas-ui.js
 * 
 * Responsabilidad: Renderizar mallas en el DOM
 * 
 * Agrupa asignaturas por nivel (semestre) y crea columnas visuales
 */

/**
 * Renderiza malla en el contenedor especificado
 * 
 * @param {Array} malla - Array de objetos: { nivel, asignatura, ... }
 * @param {string} containerId - ID del elemento contenedor (default: 'contenedorMalla')
 */
function renderizarMalla(malla, containerId) {
  // Resolver ID del contenedor
  const id = containerId || window.APP_CONFIG?.CONTAINER_ID || 'contenedorMalla';
  const contenedor = document.getElementById(id);
  
  if (!contenedor) {
    console.error(`[mallas-ui] Contenedor #${id} no encontrado`);
    return;
  }

  // Limpiar contenedor
  contenedor.innerHTML = '';
  
  // Agrupar asignaturas por nivel (semestre)
  const semestres = {};
  malla.forEach(ramo => {
    const nivel = ramo.nivel || 1;
    if (!semestres[nivel]) semestres[nivel] = [];
    semestres[nivel].push(ramo);
  });
  
  // Crear y renderizar columnas ordenadas
  Object.keys(semestres)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(nivel => {
      const columna = document.createElement('div');
      columna.classList.add('semestre');
      columna.innerHTML = `<h2>SEMESTRE ${nivel}</h2>`;
    
      // Añadir asignaturas a la columna
      semestres[nivel].forEach(ramo => {
        const divRamo = document.createElement('div');
        divRamo.classList.add('ramo');
        divRamo.textContent = ramo.asignatura || ramo.nombre || 'Sin nombre';
        columna.appendChild(divRamo);
      });
    
      contenedor.appendChild(columna);
    });
  
  console.log(`[mallas-ui] ✓ ${Object.keys(semestres).length} semestres renderizados`);
}

/**
 * Crea un campo de opciones desplegables (select)
 * 
 * @param {string} selectId - ID del elemento select
 * @param {Array} opciones - Array de objiones: [{ value, label }, ...]
 * @param {string} containerId - ID del contenedor donde insertar (opcional)
 * @param {Function} onChange - Callback cuando cambia la opción (opcional)
 */
function crearSelect(selectId, opciones, containerId, onChange) {
  // Crear elemento select
  const select = document.createElement('select');
  select.id = selectId;
  select.classList.add('select-desplegable');
  
  // Agregar opciones
  opciones.forEach(opcion => {
    const option = document.createElement('option');
    option.value = opcion.value || '';
    option.textContent = opcion.label || opcion.value;
    select.appendChild(option);
  });
  
  // Agregar callback si se proporciona
  if (onChange && typeof onChange === 'function') {
    select.addEventListener('change', onChange);
  }
  
  // Insertar en contenedor si se proporciona
  if (containerId) {
    const contenedor = document.getElementById(containerId);
    if (contenedor) {
      contenedor.appendChild(select);
    }
  }
  
  return select;
}

// Exportar global
window.renderizarMalla = renderizarMalla;
window.crearSelect = crearSelect;