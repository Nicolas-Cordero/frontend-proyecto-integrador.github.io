/**
 * historico-render.js
 * 
 * Responsabilidad: Renderizar el histórico en el DOM
 * Agrupación de datos, formateo de periodos y generación de HTML
 */

/**
 * Parsea un periodo de un registro
 * @param {string|number} p - Valor del periodo
 * @returns {Object} Objeto con year y sem
 */
function parsePeriod(p) {
  const raw = p ? String(p).trim() : '';
  if (!raw) return { year: 0, sem: 0 };

  // Extraer año (primer grupo de 4 dígitos)
  const yMatch = raw.match(/(\d{4})/);
  const year = yMatch ? parseInt(yMatch[1], 10) : 0;

  // Buscar semestre: 5º carácter si es dígito o S1/S2 en el string
  let sem = 0;
  if (raw.length >= 5 && /\d/.test(raw.charAt(4))) {
    const c = raw.charAt(4);
    if (c === '1') sem = 1;
    else if (c === '2') sem = 2;
    else if (c === '0') sem = 0;
  } else {
    const sMatch = raw.match(/S\s?([12])/i);
    if (sMatch) sem = parseInt(sMatch[1], 10);
  }
  return { year, sem };
}

/**
 * Formatea un periodo desde objeto
 * @param {Object} obj - { year, sem }
 * @returns {string} Periodo formateado
 */
function formatPeriodFromObj({ year, sem }) {
  if (!year) return 'Unknown';
  if (!sem || sem === 0) return String(year);
  return `${year} S${sem}`;
}

/**
 * Agrupa datos por periodo
 * @param {Array} datos - Array de registros
 * @returns {Object} Objeto con periodos agrupados
 */
function agruparPorPeriodo(datos) {
  const grupos = {};

  datos.forEach(item => {
    const parsed = parsePeriod(item.period || item.periodo || '');
    const key = `${parsed.year}-${parsed.sem}`;
    if (!grupos[key]) {
      grupos[key] = { label: formatPeriodFromObj(parsed), order: parsed, items: [] };
    }
    grupos[key].items.push(item);
  });

  return grupos;
}

/**
 * Ordena periodos por año y semestre descendente
 * @param {Object} grupos - Objeto de grupos
 * @returns {Array} Array de claves ordenadas
 */
function ordenarPeriodos(grupos) {
  return Object.keys(grupos).sort((a, b) => {
    const A = grupos[a].order;
    const B = grupos[b].order;
    if (A.year !== B.year) return B.year - A.year;
    return (B.sem || 0) - (A.sem || 0);
  });
}

/**
 * Renderiza el estado inicial (sin datos)
 * @param {HTMLElement} contenedor - Elemento contenedor
 */
function renderizarEstadoInicial(contenedor) {
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="sin-datos" style="padding:2rem;text-align:center;color:var(--muted)">
      <i class="fas fa-inbox" style="font-size:2rem;margin-bottom:0.5rem;display:block"></i>
      <strong>No hay proyecciones guardadas</strong>
      <div style="margin-top:.5rem">Cuando cargues proyecciones aparecerán columnas aquí.</div>
    </div>
  `;
}

/**
 * Renderiza un mensaje de error/estado
 * @param {HTMLElement} contenedor - Elemento contenedor
 * @param {string} icon - Clase de icono FontAwesome
 * @param {string} titulo - Título del mensaje
 * @param {string} subtitulo - Subtítulo
 */
function renderizarMensaje(contenedor, icon, titulo, subtitulo) {
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="sin-datos" style="padding:2rem;text-align:center;color:var(--muted)">
      <i class="fas ${icon}" style="font-size:2rem;margin-bottom:0.5rem;display:block"></i>
      <strong>${titulo}</strong>
      <div style="margin-top:.5rem">${subtitulo}</div>
    </div>
  `;
}

/**
 * Renderiza los datos agrupados en columnas
 * @param {HTMLElement} contenedor - Elemento contenedor
 * @param {Array} datos - Array de registros
 */
function renderizarDatos(contenedor, datos) {
  if (!contenedor) return;

  if (!Array.isArray(datos) || datos.length === 0) {
    renderizarEstadoInicial(contenedor);
    return;
  }

  // Agrupar y ordenar
  const grupos = agruparPorPeriodo(datos);
  const periodos = ordenarPeriodos(grupos);

  // Construir HTML
  contenedor.innerHTML = '';

  periodos.forEach((periodo, index) => {
    const columna = document.createElement('div');
    columna.className = 'columna';
    columna.setAttribute('data-col', String(index + 1));
    columna.setAttribute('aria-label', `Columna ${index + 1} - Ramos`);

    const grupo = grupos[periodo];

    // Título de la columna
    const tituloCol = document.createElement('div');
    tituloCol.className = 'titulo-col';
    tituloCol.innerHTML = `<i class="fas fa-th-list" style="color:var(--blue)"></i> ${grupo.label}`;

    // Cuerpo con ramos
    const cuerpo = document.createElement('div');
    cuerpo.className = 'cuerpo-col';

    grupo.items.forEach(reg => {
      const status = (reg.status || '').toUpperCase();
      let clase = 'ramo--pendiente';
      if (status === 'APROBADO') clase = 'ramo--aprobado';
      else if (status === 'REPROBADO') clase = 'ramo--reprobado';

      const ramo = document.createElement('div');
      ramo.className = `ramo ${clase}`;

      const tituloRamo = document.createElement('div');
      tituloRamo.className = 'titulo-ramo';
      tituloRamo.textContent = reg.course || reg.nrc || 'Curso';

      const meta = document.createElement('div');
      meta.className = 'meta-ramo';
      meta.textContent = status || 'Pendiente';

      ramo.appendChild(tituloRamo);
      ramo.appendChild(meta);
      cuerpo.appendChild(ramo);
    });

    columna.appendChild(tituloCol);
    columna.appendChild(cuerpo);
    contenedor.appendChild(columna);
  });
}

// Exportar globalmente
window.parsePeriod = parsePeriod;
window.formatPeriodFromObj = formatPeriodFromObj;
window.agruparPorPeriodo = agruparPorPeriodo;
window.ordenarPeriodos = ordenarPeriodos;
window.renderizarEstadoInicial = renderizarEstadoInicial;
window.renderizarMensaje = renderizarMensaje;
window.renderizarDatos = renderizarDatos;
