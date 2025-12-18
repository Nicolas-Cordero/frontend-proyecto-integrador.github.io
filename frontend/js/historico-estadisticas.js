// historico-estadisticas.js
// Renderiza y actualiza el recuadro de estadísticas académicas desde JS, evitando HTML hardcodeado.
(function() {
  'use strict';

  if (window.HistoricoEstadisticas) {
    delete window.HistoricoEstadisticas;
  }

  class HistoricoEstadisticas {
    constructor(opciones = {}) {
      this.selector = opciones.contenedor || '#estadisticasContainer';
      this.timers = new Map();
      this.carreraSelector = null;
      this.usuarioActual = null;
      this.reinicializar();
    }

    reinicializar() {
      this.contenedor = this.resolverContenedor(this.selector);

      if (!this.contenedor) {
        console.warn('[HistoricoEstadisticas] Contenedor no encontrado:', this.selector);
        return;
      }

      this.render();
      const inicial = {
        aprobados: 0,
        reprobados: 0,
        pendientes: 0,
        totalPeriodos: 0
      };
      this.actualizarSinAnimar(inicial);
    }

    resolverContenedor(destino) {
      if (destino instanceof HTMLElement) return destino;
      if (typeof destino === 'string') return document.querySelector(destino);
      return null;
    }

    render() {
      if (!this.contenedor) return;

      this.contenedor.innerHTML = `
        <section class="card tarjeta-estadisticas" aria-labelledby="estadisticasTitle">
          <div class="card-header cabecera-tarjeta-detalle" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas fa-chart-line"></i>
              <h3 id="estadisticasTitle" style="margin: 0;">Estadísticas Académicas</h3>
            </div>
            <div id="estadisticasCarreraSelector"></div>
          </div>
          <div class="card-body cuerpo-tarjeta-detalle">
            <div class="cuadricula-estadisticas">
              <div class="elemento-estadistica">
                <i class="fas fa-book"></i>
                <div class="contenido-estadistica">
                  <span class="numero-estadistica" id="ramosAprobados">0</span>
                  <span class="etiqueta-estadistica">Ramos aprobados</span>
                </div>
              </div>
              <div class="elemento-estadistica">
                <i class="fas fa-times-circle"></i>
                <div class="contenido-estadistica">
                  <span class="numero-estadistica" id="ramosReprobados">0</span>
                  <span class="etiqueta-estadistica">Ramos reprobados</span>
                </div>
              </div>
              <div class="elemento-estadistica">
                <i class="fas fa-clock"></i>
                <div class="contenido-estadistica">
                  <span class="numero-estadistica" id="ramosPendientes">0</span>
                  <span class="etiqueta-estadistica">Ramos pendientes</span>
                </div>
              </div>
              <div class="elemento-estadistica">
                <i class="fas fa-calendar-alt"></i>
                <div class="contenido-estadistica">
                  <span class="numero-estadistica" id="totalPeriodos">0</span>
                  <span class="etiqueta-estadistica">Periodos cursados</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

      this.elementos = {
        aprobados: this.contenedor.querySelector('#ramosAprobados'),
        reprobados: this.contenedor.querySelector('#ramosReprobados'),
        pendientes: this.contenedor.querySelector('#ramosPendientes'),
        periodos: this.contenedor.querySelector('#totalPeriodos'),
        bloques: Array.from(this.contenedor.querySelectorAll('.elemento-estadistica'))
      };
    }

    actualizarSinAnimar(estadisticas = {}) {
      if (!this.elementos) return;

      const valores = {
        aprobados: Number(estadisticas.aprobados) || 0,
        reprobados: Number(estadisticas.reprobados) || 0,
        pendientes: Number(estadisticas.pendientes) || 0,
        totalPeriodos: Number(estadisticas.totalPeriodos) || 0
      };

      this.setCargando(false);
      if (this.elementos.aprobados) this.elementos.aprobados.textContent = valores.aprobados;
      if (this.elementos.reprobados) this.elementos.reprobados.textContent = valores.reprobados;
      if (this.elementos.pendientes) this.elementos.pendientes.textContent = valores.pendientes;
      if (this.elementos.periodos) this.elementos.periodos.textContent = valores.totalPeriodos;
    }

    actualizar(estadisticas = {}) {
      if (!this.elementos) return;

      const valores = {
        aprobados: Number(estadisticas.aprobados) || 0,
        reprobados: Number(estadisticas.reprobados) || 0,
        pendientes: Number(estadisticas.pendientes) || 0,
        totalPeriodos: Number(estadisticas.totalPeriodos) || 0
      };

      this.setCargando(false);
      this.animarNumero(this.elementos.aprobados, valores.aprobados);
      this.animarNumero(this.elementos.reprobados, valores.reprobados);
      this.animarNumero(this.elementos.pendientes, valores.pendientes);
      this.animarNumero(this.elementos.periodos, valores.totalPeriodos);
    }

    async cargarDesdeUsuario(usuario, carreraSeleccionada = null) {
      if (!usuario) {
        this.actualizar({ aprobados: 0, reprobados: 0, pendientes: 0, totalPeriodos: 0 });
        return;
      }

      this.usuarioActual = usuario;
      const rut = usuario.rut || (usuario.user && usuario.user.rut) || null;
      let carreras = usuario.carreras || (usuario.user && usuario.user.carreras) || [];

      if (!rut || !Array.isArray(carreras) || carreras.length === 0) {
        this.actualizar({ aprobados: 0, reprobados: 0, pendientes: 0, totalPeriodos: 0 });
        return;
      }

      // Inicializar selector de carreras si hay múltiples (solo una vez)
      if (carreras.length > 1 && !this.carreraSelector) {
        this.inicializarCarreraSelector(carreras);
      }

      // Si no se especifica una carrera, usar la primera por defecto
      if (!carreraSeleccionada) {
        carreraSeleccionada = carreras[0];
      }

      // Filtrar solo la carrera seleccionada
      carreras = [carreraSeleccionada];

      this.setCargando(true);

      const registros = [];

      for (const carrera of carreras) {
        const codigo = carrera.codigo || carrera.code || carrera.cod || carrera.catalogo || carrera.catalog || null;
        if (!codigo) continue;

        try {
          const avance = await this.fetchAvanceForCarrera(rut, codigo);
          if (Array.isArray(avance) && avance.length) {
            registros.push(...avance);
          }
        } catch (err) {
          console.warn('[HistoricoEstadisticas] No se pudo obtener avance para', codigo, err);
        }
      }

      const stats = this.calcularEstadisticas(registros);
      this.actualizar(stats);
    }

    inicializarCarreraSelector(carreras) {
      const containerSelector = this.contenedor.querySelector('#estadisticasCarreraSelector');
      if (!containerSelector) return;

      if (!window.CarreraSelector) {
        console.warn('[HistoricoEstadisticas] CarreraSelector no está disponible');
        return;
      }

      this.carreraSelector = new window.CarreraSelector({
        contenedor: containerSelector,
        carreras: carreras,
        estiloCompacto: true, // Usar estilo compacto para el header
        onSeleccionar: (carrera) => this.onCarreraSeleccionada(carrera)
      });
    }

    onCarreraSeleccionada(carrera) {
      if (!this.usuarioActual) return;

      // Recargar estadísticas solo para la carrera seleccionada
      this.cargarDesdeUsuario(this.usuarioActual, carrera);
    }

    calcularEstadisticas(datos) {
      if (!Array.isArray(datos) || datos.length === 0) {
        return { aprobados: 0, reprobados: 0, pendientes: 0, totalPeriodos: 0 };
      }

      let aprobados = 0;
      let reprobados = 0;
      let pendientes = 0;
      const periodos = new Set();

      datos.forEach(item => {
        // Solo contar aprobados/reprobados/pendientes de inscripciones REGULAR
        const inscriptionType = (item.inscriptionType || '').toUpperCase();
        if (inscriptionType === 'REGULAR' || !item.inscriptionType) {
          const status = (item.status || '').toUpperCase();
          if (status === 'APROBADO') aprobados++;
          else if (status === 'REPROBADO') reprobados++;
          else pendientes++;
        }

        // Contar TODOS los períodos (sin filtrar por tipo de inscripción)
        const periodo = String(item.period || item.periodo || '').trim();
        if (periodo) {
          periodos.add(periodo);
        }
      });

      const periodosArray = Array.from(periodos).sort();

      return {
        aprobados,
        reprobados,
        pendientes,
        totalPeriodos: periodos.size
      };
    }

    async fetchJsonText(url, options = {}) {
      const resp = await fetch(url, options);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }
      const text = await resp.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error(`Respuesta inválida JSON desde ${url}: ${text}`);
      }
    }

    async fetchAvanceForCarrera(rut, codcarrera) {
      const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${encodeURIComponent(rut)}&codcarrera=${encodeURIComponent(codcarrera)}`;
      const datos = await this.fetchJsonText(url);
      if (Array.isArray(datos)) return datos;
      if (datos && datos.error) {
        console.warn('[HistoricoEstadisticas] API Avance respondió error:', datos.error);
        return [];
      }
      return [];
    }

    setCargando(activo = true) {
      if (!this.elementos) return;
      this.elementos.bloques.forEach(bloque => bloque.classList.toggle('cargando', activo));
    }

    animarNumero(elemento, valorFinal) {
      if (!elemento) return;
      this.limpiarTimer(elemento);

      const duracion = 1000;
      const pasos = 30;
      const incremento = valorFinal / pasos;
      const intervalo = duracion / pasos;
      let valorActual = 0;
      let contador = 0;

      const timer = setInterval(() => {
        contador++;
        valorActual += incremento;
        if (contador >= pasos) {
          clearInterval(timer);
          this.timers.delete(elemento);
          elemento.textContent = valorFinal;
        } else {
          elemento.textContent = Math.floor(valorActual);
        }
      }, intervalo);

      this.timers.set(elemento, timer);
    }

    limpiarTimer(elemento) {
      const timer = this.timers.get(elemento);
      if (timer) {
        clearInterval(timer);
        this.timers.delete(elemento);
      }
    }
  }

  function initWidget() {
    // Buscar el contenedor; si no existe, no inicializar aún
    if (!document.getElementById('estadisticasContainer')) {
      return;
    }
    
    if (!window.historicoEstadisticas) {
      window.historicoEstadisticas = new HistoricoEstadisticas();
    } else {
      // Si ya existe, reinicializar para buscar el contenedor actualizado
      window.historicoEstadisticas.reinicializar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  window.HistoricoEstadisticas = HistoricoEstadisticas;
})();
