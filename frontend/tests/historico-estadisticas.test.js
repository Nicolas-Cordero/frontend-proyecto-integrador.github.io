global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;
global.fetch = fetch;

global.window.CarreraSelector = jest.fn().mockImplementation((options) => ({
  onSeleccionar: options.onSeleccionar
}));

require('../js/historico-estadisticas.js');

const HistoricoEstadisticas = global.window.HistoricoEstadisticas || global.HistoricoEstadisticas;

describe('HistoricoEstadisticas', () => {
  let app;
  let mockContenedor;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="estadisticasContainer"></div>
    `;

    mockContenedor = document.getElementById('estadisticasContainer');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('debe inicializar correctamente', () => {
    app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    expect(app).toBeInstanceOf(HistoricoEstadisticas);
    expect(app.contenedor).toBe(mockContenedor);
  });

  describe('resolverContenedor', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe resolver selector CSS', () => {
      const elemento = app.resolverContenedor('#estadisticasContainer');
      expect(elemento).toBe(mockContenedor);
    });

    test('debe retornar elemento directamente', () => {
      const elemento = app.resolverContenedor(mockContenedor);
      expect(elemento).toBe(mockContenedor);
    });

    test('debe retornar null para selector inválido', () => {
      const elemento = app.resolverContenedor('#noexiste');
      expect(elemento).toBeNull();
    });
  });

  describe('render', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe renderizar estructura HTML', () => {
      expect(mockContenedor.innerHTML).toContain('Estadísticas Académicas');
      expect(mockContenedor.innerHTML).toContain('ramosAprobados');
      expect(mockContenedor.innerHTML).toContain('ramosReprobados');
      expect(mockContenedor.innerHTML).toContain('ramosPendientes');
      expect(mockContenedor.innerHTML).toContain('totalPeriodos');
    });

    test('debe crear referencias a elementos', () => {
      expect(app.elementos.aprobados).toBeDefined();
      expect(app.elementos.reprobados).toBeDefined();
      expect(app.elementos.pendientes).toBeDefined();
      expect(app.elementos.periodos).toBeDefined();
    });
  });

  describe('actualizarSinAnimar', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe actualizar valores sin animación', () => {
      const estadisticas = {
        aprobados: 10,
        reprobados: 2,
        pendientes: 5,
        totalPeriodos: 8
      };

      app.actualizarSinAnimar(estadisticas);

      expect(app.elementos.aprobados.textContent).toBe('10');
      expect(app.elementos.reprobados.textContent).toBe('2');
      expect(app.elementos.pendientes.textContent).toBe('5');
      expect(app.elementos.periodos.textContent).toBe('8');
    });

    test('debe usar valores por defecto si no se proporcionan', () => {
      app.actualizarSinAnimar({});
      expect(app.elementos.aprobados.textContent).toBe('0');
    });
  });

  describe('calcularEstadisticas', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe calcular estadísticas correctamente', () => {
      const datos = [
        { status: 'APROBADO', period: '202310', inscriptionType: 'REGULAR' },
        { status: 'APROBADO', period: '202320', inscriptionType: 'REGULAR' },
        { status: 'REPROBADO', period: '202310', inscriptionType: 'REGULAR' },
        { status: 'PENDIENTE', period: '202320', inscriptionType: 'REGULAR' }
      ];

      const resultado = app.calcularEstadisticas(datos);

      expect(resultado.aprobados).toBe(2);
      expect(resultado.reprobados).toBe(1);
      expect(resultado.pendientes).toBe(1);
      expect(resultado.totalPeriodos).toBe(2);
    });

    test('debe filtrar por tipo de inscripción REGULAR', () => {
      const datos = [
        { status: 'APROBADO', period: '202310', inscriptionType: 'REGULAR' },
        { status: 'APROBADO', period: '202320', inscriptionType: 'ESPECIAL' },
        { status: 'REPROBADO', period: '202310', inscriptionType: 'REGULAR' }
      ];

      const resultado = app.calcularEstadisticas(datos);

      expect(resultado.aprobados).toBe(1);
      expect(resultado.reprobados).toBe(1);
      expect(resultado.totalPeriodos).toBe(2);
    });

    test('debe retornar ceros para array vacío', () => {
      const resultado = app.calcularEstadisticas([]);
      expect(resultado.aprobados).toBe(0);
      expect(resultado.reprobados).toBe(0);
      expect(resultado.pendientes).toBe(0);
      expect(resultado.totalPeriodos).toBe(0);
    });

    test('debe retornar ceros para datos inválidos', () => {
      const resultado = app.calcularEstadisticas(null);
      expect(resultado.aprobados).toBe(0);
    });
  });

  describe('fetchAvanceForCarrera', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe obtener avance correctamente', async () => {
      const mockAvance = [
        { course: 'TEST-001', status: 'APROBADO', period: '202310' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockAvance))
      });

      const resultado = await app.fetchAvanceForCarrera('222222222', '8266');
      expect(resultado).toEqual(mockAvance);
    });

    test('debe lanzar error si respuesta no es ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(app.fetchAvanceForCarrera('222222222', '8266')).rejects.toThrow();
    });
  });

  describe('cargarDesdeUsuario', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe actualizar con ceros si no hay usuario', async () => {
      await app.cargarDesdeUsuario(null);
      expect(app.elementos.aprobados.textContent).toBe('0');
    });

    test('debe cargar estadísticas desde usuario', async () => {
      const usuario = {
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI' }]
      };

      const mockAvance = [
        { status: 'APROBADO', period: '202310', inscriptionType: 'REGULAR' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockAvance))
      });

      await app.cargarDesdeUsuario(usuario);
      expect(app.usuarioActual).toEqual(usuario);
    });

    test('debe usar primera carrera si no se especifica', async () => {
      const usuario = {
        rut: '222222222',
        carreras: [
          { codigo: '8266', nombre: 'ITI' },
          { codigo: '8616', nombre: 'ICI' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify([]))
      });

      await app.cargarDesdeUsuario(usuario);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('inicializarCarreraSelector', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
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
  });

  describe('onCarreraSeleccionada', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
      app.usuarioActual = {
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI' }]
      };
    });

    test('debe recargar estadísticas para carrera seleccionada', async () => {
      const carrera = { codigo: '8616', nombre: 'ICI' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify([]))
      });

      await app.onCarreraSeleccionada(carrera);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('no debe hacer nada si no hay usuario actual', async () => {
      app.usuarioActual = null;
      const carrera = { codigo: '8266' };
      await app.onCarreraSeleccionada(carrera);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('setCargando', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe mostrar estado de carga', () => {
      app.setCargando(true);
      const bloques = mockContenedor.querySelectorAll('.elemento-estadistica');
      bloques.forEach(bloque => {
        expect(bloque.classList.contains('cargando')).toBe(true);
      });
    });

    test('debe ocultar estado de carga', () => {
      app.setCargando(false);
      const bloques = mockContenedor.querySelectorAll('.elemento-estadistica');
      bloques.forEach(bloque => {
        expect(bloque.classList.contains('cargando')).toBe(false);
      });
    });
  });

  describe('cargarDesdeUsuario - casos adicionales', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe manejar usuario con user anidado', async () => {
      const usuario = {
        user: {
          rut: '222222222',
          carreras: [{ codigo: '8266', nombre: 'ITI' }]
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify([]))
      });

      await app.cargarDesdeUsuario(usuario);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar carrera con code en lugar de codigo', async () => {
      const usuario = {
        rut: '222222222',
        carreras: [{ code: '8266', catalog: '202410' }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify([]))
      });

      await app.cargarDesdeUsuario(usuario, { code: '8266' });
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar carrera con cod en lugar de codigo', async () => {
      const usuario = {
        rut: '222222222',
        carreras: [{ cod: '8266' }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify([]))
      });

      await app.cargarDesdeUsuario(usuario, { cod: '8266' });
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar carrera con catalogo en lugar de catalog', async () => {
      const usuario = {
        rut: '222222222',
        carreras: [{ codigo: '8266', catalogo: '202410' }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify([]))
      });

      await app.cargarDesdeUsuario(usuario);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar error al obtener avance', async () => {
      const usuario = {
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI' }]
      };

      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      await app.cargarDesdeUsuario(usuario);
      expect(app.elementos.aprobados.textContent).toBe('0');
    });
  });

  describe('calcularEstadisticas - casos adicionales', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
    });

    test('debe filtrar inscripciones no REGULAR', () => {
      const datos = [
        { status: 'APROBADO', period: '202310', inscriptionType: 'ESPECIAL' },
        { status: 'APROBADO', period: '202320', inscriptionType: 'REGULAR' }
      ];

      const resultado = app.calcularEstadisticas(datos);
      expect(resultado.aprobados).toBe(1);
      expect(resultado.totalPeriodos).toBe(2);
    });

    test('debe contar períodos sin inscriptionType', () => {
      const datos = [
        { status: 'APROBADO', period: '202310' },
        { status: 'REPROBADO', period: '202320' }
      ];

      const resultado = app.calcularEstadisticas(datos);
      expect(resultado.aprobados).toBe(1);
      expect(resultado.reprobados).toBe(1);
    });

    test('debe manejar periodo vacío', () => {
      const datos = [
        { status: 'APROBADO', period: '' },
        { status: 'REPROBADO', period: '202310' }
      ];

      const resultado = app.calcularEstadisticas(datos);
      expect(resultado.totalPeriodos).toBe(1);
    });

    test('debe manejar periodo usando campo periodo', () => {
      const datos = [
        { status: 'APROBADO', periodo: '202310' }
      ];

      const resultado = app.calcularEstadisticas(datos);
      expect(resultado.totalPeriodos).toBe(1);
    });
  });

  describe('animarNumero', () => {
    beforeEach(() => {
      app = new HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('debe animar número correctamente', () => {
      const elemento = document.getElementById('ramosAprobados');
      app.animarNumero(elemento, 10);
      expect(elemento).toBeDefined();
    });
  });
});

