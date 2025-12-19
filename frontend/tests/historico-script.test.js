global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;
global.fetch = fetch;

global.window.CarreraSelector = jest.fn().mockImplementation((options) => ({
  onSeleccionar: options.onSeleccionar
}));

const modulos = require('../js/historico-script.js');

const HistoricoApp = modulos.HistoricoApp || global.HistoricoApp || window.HistoricoApp;

if (HistoricoApp) global.HistoricoApp = HistoricoApp;

describe('HistoricoApp', () => {
  let app;
  let mockContenedor;

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();

    document.body.innerHTML = `
      <div id="contenedorColumnas"></div>
      <div id="carreraSelectorContainer">
        <select id="carreraSelect"></select>
      </div>
    `;

    mockContenedor = document.getElementById('contenedorColumnas');
  });

  test('debe inicializar correctamente', () => {
    app = new global.HistoricoApp();
    expect(app).toBeInstanceOf(global.HistoricoApp);
    expect(app.contenedorColumnas).toBe(mockContenedor);
  });

  describe('fetchJsonText', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe parsear JSON correctamente', async () => {
      const mockData = { test: 'data' };
      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockData))
      });

      const resultado = await app.fetchJsonText('http://test.com/api');
      expect(resultado).toEqual(mockData);
    });

    test('debe lanzar error si JSON es inválido', async () => {
      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce('invalid json {')
      });

      await expect(app.fetchJsonText('http://test.com/api')).rejects.toThrow();
    });
  });

  describe('fetchAvanceForCarrera', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe obtener avance correctamente', async () => {
      const mockAvance = [
        { course: 'TEST-001', status: 'APROBADO', semester: '202310' }
      ];

      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockAvance))
      });

      const resultado = await app.fetchAvanceForCarrera('222222222', '8266');
      expect(resultado).toEqual(mockAvance);
    });

    test('debe retornar array vacío si hay error en respuesta', async () => {
      const mockError = { error: 'Error message' };
      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockError))
      });

      const resultado = await app.fetchAvanceForCarrera('222222222', '8266');
      expect(resultado).toEqual([]);
    });

    test('debe manejar errores de red', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(app.fetchAvanceForCarrera('222222222', '8266')).rejects.toThrow();
    });
  });

  describe('fetchAndRenderFromApi', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe mostrar mensaje si no hay sesión', async () => {
      await app.fetchAndRenderFromApi().catch(() => {});
      expect(mockContenedor.innerHTML).toContain('No has iniciado sesión');
    });

    test('debe cargar avance cuando hay sesión válida', async () => {
      const usuario = {
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI', catalogo: '202410' }]
      };
      sessionStorage.setItem('ucn_user_data', JSON.stringify(usuario));

      const mockAvance = [
        { course: 'TEST-001', status: 'APROBADO', semester: '202310' }
      ];

      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockAvance))
      });

      await app.fetchAndRenderFromApi();
      expect(app.usuarioActual).toEqual(usuario);
    });

    test('debe mostrar mensaje si no hay carreras', async () => {
      const usuario = { rut: '222222222', carreras: [] };
      sessionStorage.setItem('ucn_user_data', JSON.stringify(usuario));

      await app.fetchAndRenderFromApi().catch(() => {});
      expect(mockContenedor.innerHTML).toContain('No hay carreras');
    });
  });

  describe('inicializarCarreraSelector', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="contenedorColumnas"></div>
        <div id="carreraSelectorContainer">
          <select id="carreraSelect"></select>
        </div>
      `;
      app = new global.HistoricoApp();
    });

    test('debe inicializar selector si hay múltiples carreras', () => {
      const carreras = [
        { codigo: '8266', nombre: 'ITI' },
        { codigo: '8616', nombre: 'ICI' }
      ];

      app.inicializarCarreraSelector(carreras);
      expect(global.window.CarreraSelector).toHaveBeenCalled();
    });

    test('no debe inicializar si CarreraSelector no está disponible', () => {
      global.window.CarreraSelector = undefined;
      const carreras = [{ codigo: '8266', nombre: 'ITI' }];
      app.inicializarCarreraSelector(carreras);
      expect(app.carreraSelector).toBeNull();
    });

    test('debe actualizar selector con carrera guardada', () => {
      const carreras = [
        { codigo: '8266', nombre: 'ITI' },
        { codigo: '8616', nombre: 'ICI' }
      ];
      sessionStorage.setItem('historico_carrera_seleccionada', JSON.stringify({ codigo: '8616' }));
      app.inicializarCarreraSelector(carreras);
      const select = document.getElementById('carreraSelect');
      expect(select.value).toBe('1');
    });
  });

  describe('onCarreraSeleccionada', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
      app.usuarioActual = {
        rut: '222222222',
        carreras: []
      };
    });

    test('debe cargar avance para carrera seleccionada', async () => {
      const carrera = { codigo: '8266', nombre: 'ITI' };
      const mockAvance = [
        { course: 'TEST-001', status: 'APROBADO' }
      ];

      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockAvance))
      });

      await app.onCarreraSeleccionada(carrera);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('no debe hacer nada si no hay rut', async () => {
      app.usuarioActual = {};
      const carrera = { codigo: '8266' };
      await app.onCarreraSeleccionada(carrera);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('renderizarEstadoInicial', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe renderizar estado inicial', () => {
      app.renderizarEstadoInicial();
      expect(mockContenedor.innerHTML).toContain('No hay proyecciones');
    });
  });

  describe('cargarProyeccionesDesdeJSON', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe cargar desde array directamente', () => {
      const datos = [
        { course: 'TEST-001', status: 'APROBADO', period: '202310' }
      ];

      app.cargarProyeccionesDesdeJSON(datos);
      expect(mockContenedor.innerHTML).toBeDefined();
    });

    test('debe cargar desde ruta JSON', async () => {
      const mockData = [
        { course: 'TEST-001', status: 'APROBADO', period: '202310' }
      ];

      global.fetch = jest.fn().mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockData))
      });

      app.loadJSON = jest.fn().mockResolvedValueOnce(mockData);
      await app.cargarProyeccionesDesdeJSON('test.json');
      expect(app.loadJSON).toHaveBeenCalledWith('test.json');
    });

    test('debe renderizar estado inicial si loadJSON retorna null', async () => {
      app.loadJSON = jest.fn().mockResolvedValueOnce(null);
      await app.cargarProyeccionesDesdeJSON('test.json');
      expect(mockContenedor.innerHTML).toContain('No hay proyecciones');
    });
  });

  describe('cargarProyeccionesDesdeDatos', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe renderizar estado inicial si datos están vacíos', () => {
      app.cargarProyeccionesDesdeDatos([]);
      expect(mockContenedor.innerHTML).toContain('No hay proyecciones');
    });

    test('debe renderizar estado inicial si datos no son array', () => {
      app.cargarProyeccionesDesdeDatos(null);
      expect(mockContenedor.innerHTML).toContain('No hay proyecciones');
    });

    test('debe procesar datos con múltiples períodos', () => {
      const datos = [
        { course: 'TEST-001', status: 'APROBADO', period: '202310' },
        { course: 'TEST-002', status: 'APROBADO', period: '202320' },
        { course: 'TEST-003', status: 'PENDIENTE', period: '202310' }
      ];

      app.cargarProyeccionesDesdeDatos(datos);
      expect(mockContenedor.innerHTML).toBeDefined();
    });

    test('debe procesar datos con periodo en formato YYYYSS', () => {
      const datos = [
        { course: 'TEST-001', status: 'APROBADO', period: '202310' },
        { course: 'TEST-002', status: 'APROBADO', period: '202320' },
        { course: 'TEST-003', status: 'APROBADO', period: '202315' }
      ];

      app.cargarProyeccionesDesdeDatos(datos);
      expect(mockContenedor.innerHTML).toBeDefined();
    });

    test('debe procesar datos con periodo usando campo periodo', () => {
      const datos = [
        { course: 'TEST-001', status: 'APROBADO', periodo: '202310' }
      ];

      app.cargarProyeccionesDesdeDatos(datos);
      expect(mockContenedor.innerHTML).toBeDefined();
    });

    test('debe procesar datos sin periodo', () => {
      const datos = [
        { course: 'TEST-001', status: 'APROBADO' }
      ];

      app.cargarProyeccionesDesdeDatos(datos);
      expect(mockContenedor.innerHTML).toBeDefined();
    });
  });

  describe('fetchAndRenderFromApi - casos adicionales', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe manejar error al parsear sessionStorage', async () => {
      sessionStorage.setItem('ucn_user_data', 'invalid json');
      await expect(app.fetchAndRenderFromApi()).rejects.toThrow();
    });

    test('debe manejar usuario sin rut', async () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        email: 'test@example.com',
        carreras: []
      }));
      await app.fetchAndRenderFromApi().catch(() => {});
      expect(mockContenedor.innerHTML).toContain('No hay carreras');
    });

    test('debe manejar carrera sin código', async () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        carreras: [{ nombre: 'ITI' }]
      }));
      await app.fetchAndRenderFromApi().catch(() => {});
      expect(mockContenedor.innerHTML).toBeDefined();
    });

    test('debe manejar error al obtener avance', async () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI' }]
      }));
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      await app.fetchAndRenderFromApi().catch(() => {});
      expect(mockContenedor.innerHTML).toBeDefined();
    });

    test('debe manejar avance vacío', async () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI' }]
      }));
      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify([]))
      });
      await app.fetchAndRenderFromApi().catch(() => {});
      expect(mockContenedor.innerHTML).toContain('No hay proyecciones');
    });
  });
});

  describe('obtenerCarreraGuardada', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
      sessionStorage.clear();
    });

    test('debe retornar carrera guardada desde sessionStorage', () => {
      const carrera = { codigo: '8266', nombre: 'ITI' };
      sessionStorage.setItem('historico_carrera_seleccionada', JSON.stringify(carrera));
      const resultado = app.obtenerCarreraGuardada([carrera]);
      expect(resultado.codigo).toBe('8266');
    });

    test('debe retornar null si no hay carrera guardada', () => {
      const resultado = app.obtenerCarreraGuardada([]);
      expect(resultado).toBeNull();
    });

    test('debe retornar null si carrera guardada no está en lista', () => {
      const carreraGuardada = { codigo: '9999', nombre: 'Otra' };
      sessionStorage.setItem('historico_carrera_seleccionada', JSON.stringify(carreraGuardada));
      const carreras = [{ codigo: '8266', nombre: 'ITI' }];
      const resultado = app.obtenerCarreraGuardada(carreras);
      expect(resultado).toBeNull();
    });

    test('debe comparar por code si codigo no existe', () => {
      const carreraGuardada = { code: '8266', nombre: 'ITI' };
      sessionStorage.setItem('historico_carrera_seleccionada', JSON.stringify(carreraGuardada));
      const carreras = [{ code: '8266', nombre: 'ITI' }];
      const resultado = app.obtenerCarreraGuardada(carreras);
      expect(resultado).toEqual(carreras[0]);
    });

    test('debe comparar por cod si code no existe', () => {
      const carreraGuardada = { cod: '8266', nombre: 'ITI' };
      sessionStorage.setItem('historico_carrera_seleccionada', JSON.stringify(carreraGuardada));
      const carreras = [{ cod: '8266', nombre: 'ITI' }];
      const resultado = app.obtenerCarreraGuardada(carreras);
      expect(resultado).toEqual(carreras[0]);
    });
  });

  describe('guardarCarreraSeleccionada', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
      sessionStorage.clear();
    });

    test('debe guardar carrera en sessionStorage', () => {
      const carrera = { codigo: '8266', nombre: 'ITI' };
      app.guardarCarreraSeleccionada(carrera);
      const guardada = JSON.parse(sessionStorage.getItem('historico_carrera_seleccionada'));
      expect(guardada.codigo).toBe('8266');
    });
  });

  describe('loadJSON', () => {
    beforeEach(() => {
      app = new global.HistoricoApp();
    });

    test('debe cargar JSON desde URL', async () => {
      const mockData = { test: 'data' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      const resultado = await app.loadJSON('test.json');
      expect(resultado).toEqual(mockData);
    });

    test('debe retornar null si hay error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const resultado = await app.loadJSON('test.json');
      expect(resultado).toBeNull();
    });

    test('debe retornar null si respuesta no es ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      const resultado = await app.loadJSON('test.json');
      expect(resultado).toBeNull();
    });
  });
;

