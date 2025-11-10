// historico-script.js
// Lógica inicial para la página historico.html
// Provee una clase HistoricoApp preparada para cargar JSONs y renderizar el contenido

class HistoricoApp {
  constructor() {
    this.contenedorColumnas = document.getElementById('contenedorColumnas');
    this.inicializar();
  }

  inicializar() {
    console.log('HistoricoApp inicializado');
    // Renderiza un estado inicial (vacío) mientras se integran datos
    this.renderizarEstadoInicial();
    // Intentar cargar los avances desde la API usando la sesión almacenada
    // Si no existe sesión, mostramos un mensaje para iniciar sesión.
    this.fetchAndRenderFromApi().catch(err => {
      console.warn('Historico: no se pudieron obtener datos desde la API:', err);
    });
  }

  // ===== Integración con la API de Avance =====
  async fetchJsonText(url, options = {}) {
    const resp = await fetch(url, options);
    const text = await resp.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`Respuesta inválida JSON desde ${url}: ${text}`);
    }
  }

  async fetchAvanceForCarrera(rut, codcarrera) {
    const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codcarrera)}`;
    try {
      const datos = await this.fetchJsonText(url);
      if (Array.isArray(datos)) return datos;
      if (datos && datos.error) {
        console.warn('API Avance respondió con error para', codcarrera, datos.error);
        return [];
      }
      return [];
    } catch (err) {
      console.error('Error al obtener avance para', codcarrera, err);
      throw err;
    }
  }

  async fetchAndRenderFromApi() {
    // Leer sesión del usuario
    const raw = sessionStorage.getItem('ucn_user_data');
    if (!raw) {
      // Mostrar instrucción para iniciar sesión
      if (this.contenedorColumnas) {
        this.contenedorColumnas.innerHTML = `
          <div class="sin-datos" style="padding:2rem;text-align:center;color:var(--muted)">
            <i class="fas fa-user-circle" style="font-size:2rem;margin-bottom:0.5rem;display:block"></i>
            <strong>No has iniciado sesión</strong>
            <div style="margin-top:.5rem">Por favor inicia sesión para ver tu histórico de avance.</div>
          </div>
        `;
      }
      throw new Error('No hay sesión de usuario');
    }

    let usuario;
    try {
      usuario = JSON.parse(raw);
    } catch (err) {
      console.error('Historico: error parseando sessionStorage:', err);
      throw err;
    }

    const rut = usuario.rut || (usuario.user && usuario.user.rut) || null;
    const carreras = usuario.carreras || (usuario.user && usuario.user.carreras) || [];

    if (!rut || !Array.isArray(carreras) || carreras.length === 0) {
      console.warn('Historico: sesión encontrada pero sin rut/carreras', usuario);
      if (this.contenedorColumnas) {
        this.contenedorColumnas.innerHTML = `
          <div class="sin-datos" style="padding:2rem;text-align:center;color:var(--muted)">
            <i class="fas fa-exclamation-circle" style="font-size:2rem;margin-bottom:0.5rem;display:block"></i>
            <strong>No hay carreras asociadas a la sesión</strong>
            <div style="margin-top:.5rem">Verifica tu cuenta o contacta soporte.</div>
          </div>
        `;
      }
      throw new Error('Sesión sin carreras');
    }

    // Por cada carrera, solicitar el avance y concatenar resultados
    const todas = [];
    for (const c of carreras) {
      const codigo = c.codigo || c.code || c.cod || null;
      if (!codigo) continue;
      try {
        const avance = await this.fetchAvanceForCarrera(rut, codigo);
        if (Array.isArray(avance) && avance.length > 0) {
          todas.push(...avance);
        }
      } catch (err) {
        // Si falla una carrera, seguimos con las demás
        console.warn('Historico: fallo al cargar avance para', codigo, err.message || err);
      }
    }

    if (todas.length === 0) {
      // Mostrar estado vacío con info
      this.renderizarEstadoInicial();
      throw new Error('No se obtuvieron registros de avance');
    }

    // Renderizar los registros combinados
    this.cargarProyeccionesDesdeDatos(todas);
  }

  async loadJSON(ruta) {
    try {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} - ${respuesta.statusText}`);
      const datos = await respuesta.json();
      return datos;
    } catch (error) {
      console.error('Error cargando JSON en HistoricoApp:', error);
      return null;
    }
  }

  // Render a partir de un array de objetos (datos ya cargados)
  cargarProyeccionesDesdeDatos(datos) {
    if (!this.contenedorColumnas) return;

    if (!Array.isArray(datos) || datos.length === 0) {
      this.renderizarEstadoInicial();
      return;
    }

    // Normalizar y agrupar por periodo (año + semestre) para evitar duplicados
    const grupos = {}; // key -> { label, order: {year, sem}, items: [] }

    const parsePeriod = (p) => {
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
    };

    const formatPeriodFromObj = ({ year, sem }) => {
      if (!year) return 'Unknown';
      if (!sem || sem === 0) return String(year);
      return `${year} S${sem}`;
    };

    datos.forEach(item => {
      const parsed = parsePeriod(item.period || item.periodo || '');
      const key = `${parsed.year}-${parsed.sem}`;
      if (!grupos[key]) grupos[key] = { label: formatPeriodFromObj(parsed), order: parsed, items: [] };
      grupos[key].items.push(item);
    });

    // Ordenar por año desc, semestre desc
    const periodos = Object.keys(grupos).sort((a, b) => {
      const A = grupos[a].order;
      const B = grupos[b].order;
      if (A.year !== B.year) return B.year - A.year;
      return (B.sem || 0) - (A.sem || 0);
    });

    // Construir HTML dinámico
    this.contenedorColumnas.innerHTML = '';

    periodos.forEach((periodo, index) => {
      const columna = document.createElement('div');
      columna.className = 'columna';
      columna.setAttribute('data-col', String(index + 1));
      columna.setAttribute('aria-label', `Columna ${index + 1} - Ramos`);

      const grupo = grupos[periodo];
      const tituloCol = document.createElement('div');
      tituloCol.className = 'titulo-col';
      tituloCol.innerHTML = `<i class="fas fa-th-list" style="color:var(--blue)"></i> ${grupo.label}`;

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
      this.contenedorColumnas.appendChild(columna);
    });
  }

  renderizarEstadoInicial() {
    if (!this.contenedorColumnas) return;

    // Mensaje simple cuando no hay proyecciones cargadas
    this.contenedorColumnas.innerHTML = `
      <div class="sin-datos" style="padding:2rem;text-align:center;color:var(--muted)">
        <i class="fas fa-inbox" style="font-size:2rem;margin-bottom:0.5rem;display:block"></i>
        <strong>No hay proyecciones guardadas</strong>
        <div style="margin-top:.5rem">Cuando cargues proyecciones aparecerán columnas aquí.</div>
      </div>
    `;
  }

  // Método público para cargar y renderizar proyecciones desde un JSON
  async cargarProyeccionesDesdeJSON(rutaJSON) {
    // Si se pasa un array ya, usarlo directamente
    if (Array.isArray(rutaJSON)) {
      this.cargarProyeccionesDesdeDatos(rutaJSON);
      return;
    }

    const datos = await this.loadJSON(rutaJSON);
    if (!datos) {
      this.renderizarEstadoInicial();
      return;
    }

    console.log('Proyecciones cargadas:', datos);
    this.cargarProyeccionesDesdeDatos(datos);
  }
}

// Inicializar cuando el DOM esté listo
function _initHistoricoApp() {
  if (!window.historicoApp) {
    window.historicoApp = new HistoricoApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initHistoricoApp);
} else {
  // Si el script se inyecta dinámicamente después de DOMContentLoaded
  _initHistoricoApp();
}

// Export para testing (Node env)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HistoricoApp };
}
