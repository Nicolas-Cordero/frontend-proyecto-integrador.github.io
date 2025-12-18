if (typeof DashboardRossService === 'undefined') {
class DashboardRossService {
  constructor() {
    this.URL_BASE_API = 'http://localhost:4000/api';
  }

  async obtenerEstadisticas(carreraCodigo = null) {
    const url = carreraCodigo 
      ? `${this.URL_BASE_API}/simulaciones/estadisticas?carrera=${carreraCodigo}`
      : `${this.URL_BASE_API}/simulaciones/estadisticas`;
    
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error('Error al obtener estadísticas');
    }
    return await respuesta.json();
  }

  procesarDatos(datos) {
    const simulaciones = datos.simulaciones || [];
    const simulacionesProxSemestre = simulaciones.filter(s => s.tipo === 'simulacion_siguiente_semestre');
    const simulacionesEgreso = simulaciones.filter(s => s.tipo === 'simulacion_egreso');

    const ramosContador = {};
    simulacionesProxSemestre.forEach(sim => {
      if (sim.contenido && Array.isArray(sim.contenido.cursos)) {
        sim.contenido.cursos.forEach(curso => {
          const clave = curso.codigo || curso.nombre;
          if (clave) {
            if (!ramosContador[clave]) {
              ramosContador[clave] = {
                codigo: curso.codigo || '',
                nombre: curso.nombre || clave,
                cantidad: 0
              };
            }
            ramosContador[clave].cantidad++;
          }
        });
      }
    });

    const ramosTop = Object.values(ramosContador)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    const carrerasContador = {};
    simulaciones.forEach(sim => {
      const carrera = sim.carrera_codigo || 'Sin carrera';
      if (!carrerasContador[carrera]) {
        carrerasContador[carrera] = {
          codigo: carrera,
          nombre: sim.carrera_nombre || carrera,
          cantidad: 0
        };
      }
      carrerasContador[carrera].cantidad++;
    });

    return {
      totalSimulaciones: simulaciones.length,
      totalProxSemestre: simulacionesProxSemestre.length,
      totalEgreso: simulacionesEgreso.length,
      ramosTop: ramosTop,
      distribucionCarreras: Object.values(carrerasContador)
    };
  }
}
window.DashboardRossService = DashboardRossService;
}

if (typeof DashboardRossApp === 'undefined') {
class DashboardRossApp {
  constructor() {
    this.service = new DashboardRossService();
    this.graficos = {};
    this.carreraSeleccionada = null;
    this.datosProcesados = null;
    this.coloresRamos = this.generarColores(10);
    this.observadorTema = null;
  }

  generarColores(cantidad) {
    const colores = [
      'rgba(102, 126, 234, 0.8)',   // Azul
      'rgba(16, 185, 129, 0.8)',    // Verde
      'rgba(236, 72, 153, 0.8)',    // Rosa
      'rgba(139, 92, 246, 0.8)',    // Púrpura
      'rgba(251, 146, 60, 0.8)',    // Naranja
      'rgba(59, 130, 246, 0.8)',    // Azul claro
      'rgba(34, 197, 94, 0.8)',     // Verde claro
      'rgba(168, 85, 247, 0.8)',    // Púrpura claro
      'rgba(239, 68, 68, 0.8)',     // Rojo
      'rgba(245, 158, 11, 0.8)'     // Amarillo
    ];
    return colores.slice(0, cantidad);
  }

  obtenerColoresBordes(cantidad) {
    const colores = [
      'rgba(102, 126, 234, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(251, 146, 60, 1)',
      'rgba(59, 130, 246, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(245, 158, 11, 1)'
    ];
    return colores.slice(0, cantidad);
  }

  obtenerTemaActual() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  obtenerColoresTema() {
    const esOscuro = this.obtenerTemaActual() === 'dark';
    return {
      texto: esOscuro ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.87)',
      grid: esOscuro ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      fondo: esOscuro ? 'rgba(30, 30, 30, 1)' : 'rgba(255, 255, 255, 1)'
    };
  }

  async inicializar(usuario) {
    this.usuario = usuario;
    this.carreras = usuario.carreras || [];
    
    if (this.carreras.length > 1) {
      this.configurarSelectorCarrera();
    } else if (this.carreras.length === 1) {
      this.carreraSeleccionada = this.carreras[0].codigo;
    }

    this.configurarObservadorTema();
    await this.cargarDatos();
  }

  configurarObservadorTema() {
    if (this.observadorTema) {
      this.observadorTema.disconnect();
    }

    this.observadorTema = new MutationObserver(() => {
      if (this.datosProcesados) {
        this.renderizarGraficos();
      }
    });

    this.observadorTema.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  configurarSelectorCarrera() {
    const selector = document.getElementById('dashboardRossSelectorCarrera');
    if (!selector) return;

    selector.style.display = 'flex';
    const select = selector.querySelector('select');
    
    select.innerHTML = '<option value="">Todas las carreras</option>';
    this.carreras.forEach(carrera => {
      const option = document.createElement('option');
      option.value = carrera.codigo;
      option.textContent = carrera.nombre || carrera.codigo;
      select.appendChild(option);
    });

    select.addEventListener('change', async (e) => {
      this.carreraSeleccionada = e.target.value || null;
      await this.cargarDatos();
    });
  }

  async cargarDatos() {
    const contenedor = document.getElementById('dashboardRossContenedor');
    if (!contenedor) return;

    contenedor.innerHTML = '<div class="dashboard-ross-loading">Cargando estadísticas...</div>';

    try {
      const datos = await this.service.obtenerEstadisticas(this.carreraSeleccionada);
      this.datosProcesados = this.service.procesarDatos(datos);
      this.renderizar();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      contenedor.innerHTML = `
        <div class="dashboard-ross-error">
          <strong>Error:</strong> No se pudieron cargar las estadísticas. ${error.message}
        </div>
      `;
    }
  }

  renderizar() {
    if (!this.datosProcesados) return;

    const contenedor = document.getElementById('dashboardRossContenedor');
    if (!contenedor) return;

    if (this.datosProcesados.totalSimulaciones === 0) {
      contenedor.innerHTML = `
        <div class="dashboard-ross-empty">
          <div class="dashboard-ross-empty-icon">📊</div>
          <p>No hay simulaciones disponibles para mostrar estadísticas.</p>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = `
      <div class="dashboard-ross-stats">
        <div class="dashboard-ross-stat-card">
          <div class="dashboard-ross-stat-card-title">Total de Simulaciones</div>
          <div class="dashboard-ross-stat-card-value">${this.datosProcesados.totalSimulaciones}</div>
        </div>
        <div class="dashboard-ross-stat-card">
          <div class="dashboard-ross-stat-card-title">Próximo Semestre</div>
          <div class="dashboard-ross-stat-card-value">${this.datosProcesados.totalProxSemestre}</div>
        </div>
        <div class="dashboard-ross-stat-card">
          <div class="dashboard-ross-stat-card-title">Egreso</div>
          <div class="dashboard-ross-stat-card-value">${this.datosProcesados.totalEgreso}</div>
        </div>
      </div>
      <div class="dashboard-ross-charts">
        <div class="dashboard-ross-chart-container">
          <div class="dashboard-ross-chart-title">Top 10 Ramos Más Solicitados</div>
          <div class="dashboard-ross-chart-subtitle">Simulaciones Próximo Semestre</div>
          <div class="dashboard-ross-chart-wrapper">
            <canvas id="graficoRamos"></canvas>
          </div>
        </div>
        <div class="dashboard-ross-chart-container">
          <div class="dashboard-ross-chart-title">Top 10 Ramos Más Solicitados</div>
          <div class="dashboard-ross-chart-subtitle">Simulaciones Próximo Semestre</div>
          <div class="dashboard-ross-chart-wrapper">
            <canvas id="graficoRamosTorta"></canvas>
          </div>
        </div>
        <div class="dashboard-ross-chart-container">
          <div class="dashboard-ross-chart-title">Distribución por Tipo</div>
          <div class="dashboard-ross-chart-wrapper">
            <canvas id="graficoTipoBarras"></canvas>
          </div>
        </div>
        <div class="dashboard-ross-chart-container">
          <div class="dashboard-ross-chart-title">Distribución por Tipo</div>
          <div class="dashboard-ross-chart-wrapper">
            <canvas id="graficoTipo"></canvas>
          </div>
        </div>
        ${this.datosProcesados.distribucionCarreras.length > 1 ? `
        <div class="dashboard-ross-chart-container">
          <div class="dashboard-ross-chart-title">Distribución por Carrera</div>
          <div class="dashboard-ross-chart-wrapper">
            <canvas id="graficoCarreras"></canvas>
          </div>
        </div>
        ` : ''}
      </div>
    `;

    this.renderizarGraficos();
  }

  renderizarGraficos() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js no está disponible');
      return;
    }

    this.destruirGraficos();

    this.renderizarGraficoRamos();
    this.renderizarGraficoRamosTorta();
    this.renderizarGraficoTipoBarras();
    this.renderizarGraficoTipo();
    if (this.datosProcesados.distribucionCarreras.length > 1) {
      this.renderizarGraficoCarreras();
    }
  }

  renderizarGraficoRamos() {
    const canvas = document.getElementById('graficoRamos');
    if (!canvas || !this.datosProcesados.ramosTop.length) return;

    const ctx = canvas.getContext('2d');
    const datos = [...this.datosProcesados.ramosTop].reverse();
    const colores = this.obtenerColoresTema();
    const coloresBarras = this.generarColores(datos.length);
    const coloresBordes = this.obtenerColoresBordes(datos.length);

    this.graficos.ramos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.map(r => r.nombre.length > 30 ? r.nombre.substring(0, 30) + '...' : r.nombre),
        datasets: [{
          label: 'Cantidad de simulaciones',
          data: datos.map(r => r.cantidad),
          backgroundColor: coloresBarras,
          borderColor: coloresBordes,
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            onClick: () => {}
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: colores.texto
            },
            grid: {
              color: colores.grid
            }
          },
          y: {
            ticks: {
              color: colores.texto
            },
            grid: {
              color: colores.grid
            }
          }
        }
      }
    });
  }

  renderizarGraficoRamosTorta() {
    const canvas = document.getElementById('graficoRamosTorta');
    if (!canvas || !this.datosProcesados.ramosTop.length) return;

    const ctx = canvas.getContext('2d');
    const datos = this.datosProcesados.ramosTop;
    const colores = this.obtenerColoresTema();
    const coloresTorta = this.generarColores(datos.length);
    const coloresBordes = this.obtenerColoresBordes(datos.length);

    this.graficos.ramosTorta = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: datos.map(r => r.nombre.length > 25 ? r.nombre.substring(0, 25) + '...' : r.nombre),
        datasets: [{
          data: datos.map(r => r.cantidad),
          backgroundColor: coloresTorta,
          borderColor: coloresBordes,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colores.texto,
              usePointStyle: true,
              padding: 15
            },
            onClick: (e, legendItem, legend) => {
              const index = legendItem.index;
              const chart = this.graficos.ramosTorta;
              if (chart && chart.data && chart.data.datasets && chart.data.datasets[0]) {
                const meta = chart.getDatasetMeta(0);
                if (meta && meta.data && meta.data[index] !== undefined) {
                  meta.data[index].hidden = !meta.data[index].hidden;
                  chart.update();
                }
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  renderizarGraficoTipoBarras() {
    const canvas = document.getElementById('graficoTipoBarras');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const colores = this.obtenerColoresTema();

    this.graficos.tipoBarras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Próximo Semestre', 'Egreso'],
        datasets: [{
          label: 'Simulaciones',
          data: [
            this.datosProcesados.totalProxSemestre,
            this.datosProcesados.totalEgreso
          ],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(16, 185, 129, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: colores.texto
            },
            grid: {
              color: colores.grid
            }
          },
          x: {
            ticks: {
              color: colores.texto
            },
            grid: {
              color: colores.grid
            }
          }
        }
      }
    });
  }

  renderizarGraficoTipo() {
    const canvas = document.getElementById('graficoTipo');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const colores = this.obtenerColoresTema();

    this.graficos.tipo = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Próximo Semestre', 'Egreso'],
        datasets: [{
          data: [
            this.datosProcesados.totalProxSemestre,
            this.datosProcesados.totalEgreso
          ],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(16, 185, 129, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colores.texto,
              usePointStyle: true,
              padding: 15
            },
            onClick: () => {}
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  renderizarGraficoCarreras() {
    const canvas = document.getElementById('graficoCarreras');
    if (!canvas || !this.datosProcesados.distribucionCarreras.length) return;

    const ctx = canvas.getContext('2d');
    const datos = this.datosProcesados.distribucionCarreras;
    const colores = this.obtenerColoresTema();

    this.graficos.carreras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.map(c => c.nombre),
        datasets: [{
          label: 'Simulaciones',
          data: datos.map(c => c.cantidad),
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: colores.texto
            },
            grid: {
              color: colores.grid
            }
          },
          x: {
            ticks: {
              color: colores.texto
            },
            grid: {
              color: colores.grid
            }
          }
        }
      }
    });
  }

  destruirGraficos() {
    Object.values(this.graficos).forEach(grafico => {
      if (grafico) {
        grafico.destroy();
      }
    });
    this.graficos = {};
  }
}
window.DashboardRossApp = DashboardRossApp;
}
