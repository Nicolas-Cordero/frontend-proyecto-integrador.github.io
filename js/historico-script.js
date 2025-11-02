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

    // Datos de prueba iniciales (ejemplo según esquema proporcionado)
    const sampleData = [
      {"nrc":"21943","period":"202320","student":"333333333","course":"ECIN-00704","excluded":false,"inscriptionType":"REGULAR","status":"APROBADO"},
      {"nrc":"21944","period":"202320","student":"333333333","course":"ECIN-00600","excluded":false,"inscriptionType":"REGULAR","status":"REPROBADO"},
      {"nrc":"21945","period":"202420","student":"333333333","course":"ECIN-00800","excluded":false,"inscriptionType":"REGULAR","status":"PENDIENTE"},
      {"nrc":"21946","period":"202420","student":"333333333","course":"ECIN-00900","excluded":false,"inscriptionType":"REGULAR","status":"APROBADO"},
      {"nrc":"21947","period":"202520","student":"333333333","course":"ECIN-01000","excluded":false,"inscriptionType":"REGULAR","status":"PENDIENTE"}
    ];

    // Renderizar los datos de ejemplo inmediatamente para inspección
    this.cargarProyeccionesDesdeDatos(sampleData);
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

    // Agrupar por periodo
    const grupos = {};
    datos.forEach(item => {
      const periodo = item.period || 'unknown';
      if (!grupos[periodo]) grupos[periodo] = [];
      grupos[periodo].push(item);
    });

    // Ordenar periodos (descendente por default)
    const periodos = Object.keys(grupos).sort((a,b) => b.localeCompare(a));

    // Helper: convertir periodos como '202320' -> '2023 S2' (si aplica)
    const formatPeriod = (p) => {
      if (!p || typeof p !== 'string') return String(p);
      // Si el formato es YYYYx... tomamos los 4 primeros como año y el quinto como semestre
      if (p.length >= 5) {
        const year = p.slice(0,4);
        const semChar = p.charAt(4);
        if (semChar === '1') return `${year} S1`;
        if (semChar === '2') return `${year} S2`;
        // mapping para otros códigos comunes (por si usan 0/5 etc.)
        if (semChar === '0') return `${year}`;
      }
      return p;
    };

    // Construir HTML dinámico
    this.contenedorColumnas.innerHTML = '';

    periodos.forEach((periodo, index) => {
      const columna = document.createElement('div');
      columna.className = 'columna';
      columna.setAttribute('data-col', String(index + 1));
      columna.setAttribute('aria-label', `Columna ${index + 1} - Ramos`);

  const tituloCol = document.createElement('div');
      tituloCol.className = 'titulo-col';
  tituloCol.innerHTML = `<i class="fas fa-th-list" style="color:var(--blue)"></i> ${formatPeriod(periodo)}`;

      const cuerpo = document.createElement('div');
      cuerpo.className = 'cuerpo-col';

      grupos[periodo].forEach(reg => {
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
