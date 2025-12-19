global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;
global.fetch = fetch;

global.Chart = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  update: jest.fn()
}));

require('../js/dashboard-ross.js');

const DashboardRossService = global.window.DashboardRossService || global.DashboardRossService;
const DashboardRossApp = global.window.DashboardRossApp || global.DashboardRossApp;

describe('DashboardRossService', () => {
  let service;

  beforeEach(() => {
    service = new DashboardRossService();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('obtenerEstadisticas', () => {
    test('debe obtener estadísticas sin filtro de carrera', async () => {
      const mockData = {
        total: 10,
        simulaciones: []
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      const resultado = await service.obtenerEstadisticas();
      expect(resultado).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/simulaciones/estadisticas');
    });

    test('debe obtener estadísticas con filtro de carrera', async () => {
      const mockData = {
        total: 5,
        simulaciones: []
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      const resultado = await service.obtenerEstadisticas('8266');
      expect(resultado).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/simulaciones/estadisticas?carrera=8266'
      );
    });

    test('debe lanzar error si la respuesta no es ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(service.obtenerEstadisticas()).rejects.toThrow('Error al obtener estadísticas');
    });
  });

  describe('procesarDatos', () => {
    test('debe procesar datos correctamente', () => {
      const datos = {
        simulaciones: [
          {
            tipo: 'simulacion_siguiente_semestre',
            contenido: {
              cursos: [
                { codigo: 'TEST-001', nombre: 'Test 1' },
                { codigo: 'TEST-002', nombre: 'Test 2' },
                { codigo: 'TEST-001', nombre: 'Test 1' }
              ]
            },
            carrera_codigo: '8266',
            carrera_nombre: 'ITI'
          },
          {
            tipo: 'simulacion_egreso',
            carrera_codigo: '8266',
            carrera_nombre: 'ITI'
          }
        ]
      };

      const resultado = service.procesarDatos(datos);

      expect(resultado.totalSimulaciones).toBe(2);
      expect(resultado.totalProxSemestre).toBe(1);
      expect(resultado.totalEgreso).toBe(1);
      expect(resultado.ramosTop.length).toBeGreaterThan(0);
      expect(resultado.ramosTop[0].codigo).toBe('TEST-001');
      expect(resultado.ramosTop[0].cantidad).toBe(2);
    });

    test('debe retornar top 10 ramos ordenados', () => {
      const datos = {
        simulaciones: [
          {
            tipo: 'simulacion_siguiente_semestre',
            contenido: {
              cursos: Array.from({ length: 15 }, (_, i) => ({
                codigo: `TEST-${i}`,
                nombre: `Test ${i}`
              }))
            }
          }
        ]
      };

      const resultado = service.procesarDatos(datos);
      expect(resultado.ramosTop.length).toBeLessThanOrEqual(10);
    });

    test('debe manejar simulaciones sin contenido', () => {
      const datos = {
        simulaciones: [
          {
            tipo: 'simulacion_siguiente_semestre',
            carrera_codigo: '8266'
          }
        ]
      };

      const resultado = service.procesarDatos(datos);
      expect(resultado.totalSimulaciones).toBe(1);
      expect(resultado.ramosTop.length).toBe(0);
    });

    test('debe contar distribución por carrera', () => {
      const datos = {
        simulaciones: [
          {
            tipo: 'simulacion_siguiente_semestre',
            carrera_codigo: '8266',
            carrera_nombre: 'ITI'
          },
          {
            tipo: 'simulacion_egreso',
            carrera_codigo: '8616',
            carrera_nombre: 'ICI'
          },
          {
            tipo: 'simulacion_siguiente_semestre',
            carrera_codigo: '8266',
            carrera_nombre: 'ITI'
          }
        ]
      };

      const resultado = service.procesarDatos(datos);
      expect(resultado.distribucionCarreras.length).toBe(2);
      const carrera8266 = resultado.distribucionCarreras.find(c => c.codigo === '8266');
      expect(carrera8266.cantidad).toBe(2);
    });
  });
});

describe('DashboardRossApp', () => {
  let app;
  let mockContenedor;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    global.Chart.mockClear();

    document.body.innerHTML = `
      <div id="dashboardRossContainer"></div>
      <select id="selectorCarreraDashboard"></select>
    `;

    mockContenedor = document.getElementById('dashboardRossContainer');
    app = new DashboardRossApp();
  });

  test('debe inicializar correctamente', () => {
    expect(app.service).toBeInstanceOf(DashboardRossService);
    expect(app.graficos).toEqual({});
    expect(app.coloresRamos.length).toBe(10);
  });

  describe('generarColores', () => {
    test('debe generar array de colores', () => {
      const colores = app.generarColores(5);
      expect(colores.length).toBe(5);
      expect(colores[0]).toContain('rgba');
    });

    test('debe limitar cantidad de colores', () => {
      const colores = app.generarColores(15);
      expect(colores.length).toBe(10);
    });
  });

  describe('obtenerTemaActual', () => {
    test('debe retornar tema actual del documento', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(app.obtenerTemaActual()).toBe('dark');

      document.documentElement.setAttribute('data-theme', 'light');
      expect(app.obtenerTemaActual()).toBe('light');
    });

    test('debe retornar light por defecto', () => {
      document.documentElement.removeAttribute('data-theme');
      expect(app.obtenerTemaActual()).toBe('light');
    });
  });

  describe('obtenerColoresTema', () => {
    test('debe retornar colores para tema oscuro', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const colores = app.obtenerColoresTema();
      expect(colores.texto).toContain('255');
      expect(colores.fondo).toContain('30');
    });

    test('debe retornar colores para tema claro', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      const colores = app.obtenerColoresTema();
      expect(colores.texto).toContain('0');
      expect(colores.fondo).toContain('255');
    });
  });

  describe('cargarDatos', () => {
    test('debe cargar y procesar datos correctamente', async () => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor"></div>
      `;
      app = new DashboardRossApp();

      const mockEstadisticas = {
        simulaciones: [
          {
            tipo: 'simulacion_siguiente_semestre',
            contenido: {
              cursos: [{ codigo: 'TEST-001', nombre: 'Test' }]
            },
            carrera_codigo: '8266',
            carrera_nombre: 'ITI'
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockEstadisticas)
      });

      await app.cargarDatos();

      expect(app.datosProcesados).toBeDefined();
      expect(app.datosProcesados.totalSimulaciones).toBe(1);
    });

    test('debe manejar errores al cargar datos', async () => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor"></div>
      `;
      app = new DashboardRossApp();
      const contenedor = document.getElementById('dashboardRossContenedor');

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await app.cargarDatos();

      expect(contenedor.innerHTML).toContain('Error');
    });
  });

  describe('renderizarGraficos', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoRamos"></canvas>
          <canvas id="graficoRamosTorta"></canvas>
          <canvas id="graficoTipoBarras"></canvas>
          <canvas id="graficoTipo"></canvas>
          <canvas id="graficoCarreras"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
      app.datosProcesados = {
        totalSimulaciones: 10,
        totalProxSemestre: 5,
        totalEgreso: 5,
        ramosTop: [
          { codigo: 'TEST-001', nombre: 'Test 1', cantidad: 3 },
          { codigo: 'TEST-002', nombre: 'Test 2', cantidad: 2 }
        ],
        distribucionCarreras: [
          { codigo: '8266', nombre: 'ITI', cantidad: 10 }
        ]
      };
    });

    test('debe crear gráficos cuando hay datos', () => {
      app.renderizarGraficos();
      expect(global.Chart).toHaveBeenCalled();
    });

    test('no debe crear gráficos si no hay datos procesados', () => {
      app.datosProcesados = null;
      app.renderizarGraficos();
      expect(global.Chart).not.toHaveBeenCalled();
    });
  });

  describe('inicializar', () => {
    test('debe configurar selector si hay múltiples carreras', async () => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor"></div>
        <div id="dashboardRossSelectorCarrera" style="display: none;">
          <select></select>
        </div>
      `;
      app = new DashboardRossApp();

      const usuario = {
        carreras: [
          { codigo: '8266', nombre: 'ITI' },
          { codigo: '8616', nombre: 'ICI' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ simulaciones: [] })
      });

      await app.inicializar(usuario);

      expect(app.carreras.length).toBe(2);
    });

    test('debe seleccionar única carrera automáticamente', async () => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor"></div>
      `;
      app = new DashboardRossApp();

      const usuario = {
        carreras: [{ codigo: '8266', nombre: 'ITI' }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ simulaciones: [] })
      });

      await app.inicializar(usuario);

      expect(app.carreraSeleccionada).toBe('8266');
    });
  });

  describe('configurarSelectorCarrera', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor"></div>
        <div id="dashboardRossSelectorCarrera" style="display: none;">
          <select></select>
        </div>
      `;
      app = new DashboardRossApp();
    });

    test('debe configurar selector de carrera', () => {
      const carreras = [
        { codigo: '8266', nombre: 'ITI' },
        { codigo: '8616', nombre: 'ICI' }
      ];

      app.configurarSelectorCarrera(carreras);
      const selector = document.getElementById('dashboardRossSelectorCarrera');
      expect(selector.style.display).toBe('flex');
    });
  });

  describe('renderizar', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoRamos"></canvas>
          <canvas id="graficoRamosTorta"></canvas>
          <canvas id="graficoTipoBarras"></canvas>
          <canvas id="graficoTipo"></canvas>
          <canvas id="graficoCarreras"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
    });

    test('debe renderizar estado vacío si no hay simulaciones', () => {
      app.datosProcesados = {
        totalSimulaciones: 0
      };
      app.renderizar();
      const contenedor = document.getElementById('dashboardRossContenedor');
      expect(contenedor.innerHTML).toContain('No hay simulaciones');
    });

    test('debe renderizar estadísticas cuando hay datos', () => {
      app.datosProcesados = {
        totalSimulaciones: 10,
        totalProxSemestre: 5,
        totalEgreso: 5,
        ramosTop: [],
        distribucionCarreras: []
      };
      app.renderizar();
      const contenedor = document.getElementById('dashboardRossContenedor');
      expect(contenedor.innerHTML).toContain('Total de Simulaciones');
    });

    test('debe renderizar gráfico de carreras si hay múltiples', () => {
      app.datosProcesados = {
        totalSimulaciones: 10,
        totalProxSemestre: 5,
        totalEgreso: 5,
        ramosTop: [],
        distribucionCarreras: [
          { codigo: '8266', nombre: 'ITI', cantidad: 5 },
          { codigo: '8616', nombre: 'ICI', cantidad: 5 }
        ]
      };
      app.renderizar();
      const contenedor = document.getElementById('dashboardRossContenedor');
      expect(contenedor.innerHTML).toContain('Distribución por Carrera');
    });
  });

  describe('destruirGraficos', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoRamos"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
      app.graficos = {
        ramos: { destroy: jest.fn() },
        ramosTorta: { destroy: jest.fn() },
        tipo: { destroy: jest.fn() },
        tipoBarras: { destroy: jest.fn() },
        carreras: { destroy: jest.fn() }
      };
    });

    test('debe destruir todos los gráficos', () => {
      app.destruirGraficos();
      expect(app.graficos.ramos.destroy).toHaveBeenCalled();
      expect(app.graficos.ramosTorta.destroy).toHaveBeenCalled();
    });
  });

  describe('configurarObservadorTema', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor"></div>
      `;
      app = new DashboardRossApp();
      app.datosProcesados = {
        totalSimulaciones: 10,
        ramosTop: [],
        distribucionCarreras: []
      };
    });

    test('debe configurar observador de tema', () => {
      app.configurarObservadorTema();
      expect(app.observadorTema).toBeDefined();
    });

    test('debe desconectar observador previo si existe', () => {
      const disconnectSpy = jest.fn();
      app.observadorTema = { disconnect: disconnectSpy };
      app.configurarObservadorTema();
      expect(disconnectSpy).toHaveBeenCalled();
    });

    test('debe renderizar gráficos cuando cambia tema y hay datos', () => {
      app.datosProcesados = {
        totalSimulaciones: 10,
        ramosTop: [{ codigo: 'TEST-001', cantidad: 5 }],
        distribucionCarreras: []
      };
      const renderizarSpy = jest.spyOn(app, 'renderizarGraficos').mockImplementation(() => {});
      
      app.configurarObservadorTema();
      
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(renderizarSpy).toHaveBeenCalled();
      
      renderizarSpy.mockRestore();
    });

    test('no debe renderizar si no hay datosProcesados', () => {
      app.datosProcesados = null;
      const renderizarSpy = jest.spyOn(app, 'renderizarGraficos').mockImplementation(() => {});
      
      app.configurarObservadorTema();
      
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(renderizarSpy).not.toHaveBeenCalled();
      
      renderizarSpy.mockRestore();
    });
  });

  describe('renderizarGraficoRamos', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoRamos"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
      app.datosProcesados = {
        ramosTop: [
          { codigo: 'TEST-001', nombre: 'Test Course Very Long Name That Should Be Truncated', cantidad: 5 }
        ]
      };
    });

    test('debe renderizar gráfico de ramos', () => {
      app.renderizarGraficoRamos();
      expect(global.Chart).toHaveBeenCalled();
    });

    test('no debe renderizar si no hay canvas', () => {
      document.getElementById('graficoRamos').remove();
      app.renderizarGraficoRamos();
      expect(global.Chart).not.toHaveBeenCalled();
    });

    test('no debe renderizar si no hay datos', () => {
      app.datosProcesados.ramosTop = [];
      app.renderizarGraficoRamos();
      expect(global.Chart).not.toHaveBeenCalled();
    });
  });

  describe('renderizarGraficoRamosTorta', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoRamosTorta"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
      app.datosProcesados = {
        ramosTop: [
          { codigo: 'TEST-001', nombre: 'Test Course', cantidad: 5 }
        ]
      };
    });

    test('debe renderizar gráfico de torta', () => {
      app.renderizarGraficoRamosTorta();
      expect(global.Chart).toHaveBeenCalled();
    });

    test('no debe renderizar si no hay canvas', () => {
      document.getElementById('graficoRamosTorta').remove();
      app.renderizarGraficoRamosTorta();
      expect(global.Chart).not.toHaveBeenCalled();
    });
  });

  describe('renderizarGraficoTipo', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoTipo"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
      app.datosProcesados = {
        totalProxSemestre: 5,
        totalEgreso: 3
      };
    });

    test('debe renderizar gráfico de tipo', () => {
      app.renderizarGraficoTipo();
      expect(global.Chart).toHaveBeenCalled();
    });
  });

  describe('renderizarGraficoTipoBarras', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoTipoBarras"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
      app.datosProcesados = {
        totalProxSemestre: 5,
        totalEgreso: 3
      };
    });

    test('debe renderizar gráfico de barras de tipo', () => {
      app.renderizarGraficoTipoBarras();
      expect(global.Chart).toHaveBeenCalled();
    });
  });

  describe('renderizarGraficoCarreras', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dashboardRossContenedor">
          <canvas id="graficoCarreras"></canvas>
        </div>
      `;
      app = new DashboardRossApp();
      app.datosProcesados = {
        distribucionCarreras: [
          { codigo: '8266', nombre: 'ITI', cantidad: 5 },
          { codigo: '8616', nombre: 'ICI', cantidad: 3 }
        ]
      };
    });

    test('debe renderizar gráfico de carreras', () => {
      app.renderizarGraficoCarreras();
      expect(global.Chart).toHaveBeenCalled();
    });
  });
});

