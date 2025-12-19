global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;
global.fetch = fetch;

global.window.obtenerMallas = jest.fn();
global.window.DATOS_MALLA_ACTUAL = [];
global.window.DEFAULT_MALLA = [
  { codigo: 'DCCB-00106', asignatura: 'CÁLCULO I', nivel: 1, creditos: 6, prereq: '' },
  { codigo: 'DCCB-00107', asignatura: 'ÁLGEBRA I', nivel: 1, creditos: 6, prereq: '' },
  { codigo: 'DCCB-00204', asignatura: 'PROGRAMACIÓN', nivel: 2, creditos: 8, prereq: 'DCCB-00106,DCCB-00107' }
];

require('../js/simulacion-prox-semestre.js');

const SimulacionProxSemestreApp = global.window.simulacionProxSemestreApp?.constructor || 
  (global.window.simulacionProxSemestreApp ? Object.getPrototypeOf(global.window.simulacionProxSemestreApp).constructor : null);

describe('SimulacionProxSemestreApp', () => {
  let app;
  let mockBtn;
  let mockSelectorCarrera;
  let mockSelectorContainer;
  let mockRamosContainer;

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
    global.window.obtenerMallas = jest.fn().mockResolvedValue([]);
    global.window.DATOS_MALLA_ACTUAL = [];

    document.body.innerHTML = `
      <button id="botonProbarSimulacion">Generar Simulación</button>
      <div id="estadoSimulacion"></div>
      <div id="resultadoSimulacion"></div>
      <div id="ramosAdelantablesContainer"></div>
      <div id="ramosCounter"></div>
      <div id="selectorCarreraContainer" style="display: none;">
        <select id="selectCarreraSimulacion"></select>
      </div>
    `;

    mockBtn = document.getElementById('botonProbarSimulacion');
    mockSelectorCarrera = document.getElementById('selectCarreraSimulacion');
    mockSelectorContainer = document.getElementById('selectorCarreraContainer');
    mockRamosContainer = document.getElementById('ramosAdelantablesContainer');
  });

  test('debe inicializar correctamente', () => {
    sessionStorage.setItem('ucn_user_data', JSON.stringify({
      rut: '222222222',
      email: 'test@example.com',
      carreras: [{ codigo: '8266', nombre: 'ITI', catalogo: '202410' }]
    }));

    app = new SimulacionProxSemestreApp();
    expect(app).toBeDefined();
    expect(app.carreras).toBeDefined();
  });

  describe('getUsuario', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
    });

    test('debe retornar usuario desde sessionStorage', () => {
      const usuario = { rut: '222222222', email: 'test@example.com' };
      sessionStorage.setItem('ucn_user_data', JSON.stringify(usuario));
      
      const resultado = app.getUsuario();
      expect(resultado.rut).toBe('222222222');
    });

    test('debe retornar null si no hay usuario', () => {
      const resultado = app.getUsuario();
      expect(resultado).toBeNull();
    });

    test('debe retornar null si JSON es inválido', () => {
      sessionStorage.setItem('ucn_user_data', 'json inválido {');
      const resultado = app.getUsuario();
      expect(resultado).toBeNull();
    });
  });

  describe('inicializarCarreras', () => {
    test('debe auto-seleccionar primera carrera cuando hay múltiples', () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '333333333',
        carreras: [
          { codigo: '8266', nombre: 'ITI', catalogo: '202410' },
          { codigo: '8616', nombre: 'ICI', catalogo: '202310' }
        ]
      }));

      app = new SimulacionProxSemestreApp();
      
      expect(mockSelectorContainer.style.display).toBe('block');
      expect(mockSelectorCarrera.value).toBe('8266');
      expect(app.carreraSeleccionada.codigo).toBe('8266');
    });

    test('debe seleccionar única carrera automáticamente', () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI', catalogo: '202410' }]
      }));

      app = new SimulacionProxSemestreApp();
      
      expect(app.carreraSeleccionada.codigo).toBe('8266');
    });

    test('debe manejar carrera sin código', () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        carreras: [{ name: 'ITI', catalog: '202410' }]
      }));

      app = new SimulacionProxSemestreApp();
      expect(app.carreraSeleccionada).toBeDefined();
    });
  });

  describe('configurarEventos', () => {
    beforeEach(() => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI' }]
      }));
      app = new SimulacionProxSemestreApp();
    });

    test('debe manejar cambio de carrera', () => {
      app.carreras = [
        { codigo: '8266', nombre: 'ITI' },
        { codigo: '8616', nombre: 'ICI' }
      ];
      mockSelectorCarrera.value = '8616';
      const event = new Event('change', { bubbles: true });
      mockSelectorCarrera.dispatchEvent(event);
      expect(app.carreraSeleccionada).toBeDefined();
    });
  });

  describe('obtenerRamosDisponibles', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
    });

    test('debe retornar ramos desde DATOS_MALLA_ACTUAL', () => {
      global.window.DATOS_MALLA_ACTUAL = [
        { codigo: 'TEST-001', asignatura: 'Test', nivel: 1, creditos: 6, prereq: '' }
      ];

      const ramos = app.obtenerRamosDisponibles();
      expect(ramos.length).toBe(1);
      expect(ramos[0].codigo).toBe('TEST-001');
    });

    test('debe usar DEFAULT_MALLA si DATOS_MALLA_ACTUAL está vacío', () => {
      global.window.DATOS_MALLA_ACTUAL = [];
      const ramos = app.obtenerRamosDisponibles();
      expect(ramos.length).toBeGreaterThan(0);
    });

    test('debe normalizar propiedades de ramos', () => {
      global.window.DATOS_MALLA_ACTUAL = [
        { code: 'TEST-001', name: 'Test Course', level: 2, credits: 8, prerequisites: '' }
      ];

      const ramos = app.obtenerRamosDisponibles();
      expect(ramos[0].codigo).toBe('TEST-001');
      expect(ramos[0].nombre).toBe('Test Course');
      expect(ramos[0].nivel).toBe(2);
      expect(ramos[0].creditos).toBe(8);
    });
  });

  describe('procesarAvance', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
    });

    test('debe identificar ramos aprobados y pendientes', () => {
      const avanceData = [
        { course: 'DCCB-00106', status: 'APROBADO' },
        { course: 'DCCB-00107', status: 'APROBADO' }
      ];

      const mallaData = [
        { codigo: 'DCCB-00106', nombre: 'CÁLCULO I', nivel: 1, creditos: 6, prereq: '' },
        { codigo: 'DCCB-00107', nombre: 'ÁLGEBRA I', nivel: 1, creditos: 6, prereq: '' },
        { codigo: 'DCCB-00204', nombre: 'PROGRAMACIÓN', nivel: 2, creditos: 8, prereq: '' }
      ];

      const resultado = app.procesarAvance(avanceData, mallaData);
      
      expect(resultado.codigosAprobados.size).toBe(2);
      expect(resultado.ramosPendientes.length).toBe(1);
      expect(resultado.ramosPendientes[0].codigo).toBe('DCCB-00204');
    });

    test('debe manejar avance vacío', () => {
      const mallaData = [
        { codigo: 'DCCB-00106', nombre: 'CÁLCULO I', nivel: 1, creditos: 6, prereq: '' }
      ];

      const resultado = app.procesarAvance([], mallaData);
      expect(resultado.codigosAprobados.size).toBe(0);
      expect(resultado.ramosPendientes.length).toBe(1);
    });
  });

  describe('validarPrerequisitos', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
    });

    test('debe retornar true si no hay prerrequisitos', () => {
      const ramo = { codigo: 'TEST-001', prereq: '' };
      const codigosAprobados = new Set();
      
      expect(app.validarPrerequisitos(ramo, codigosAprobados)).toBe(true);
    });

    test('debe retornar true si todos los prerrequisitos están aprobados', () => {
      const ramo = { codigo: 'TEST-002', prereq: 'TEST-001,TEST-003' };
      const codigosAprobados = new Set(['TEST-001', 'TEST-003']);
      
      expect(app.validarPrerequisitos(ramo, codigosAprobados)).toBe(true);
    });

    test('debe retornar false si faltan prerrequisitos', () => {
      const ramo = { codigo: 'TEST-002', prereq: 'TEST-001,TEST-003' };
      const codigosAprobados = new Set(['TEST-001']);
      
      expect(app.validarPrerequisitos(ramo, codigosAprobados)).toBe(false);
    });
  });

  describe('obtenerAvanceEstudiante', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
    });

    test('debe obtener avance sin filtro de carrera', async () => {
      const mockAvance = [{ course: 'TEST-001', status: 'APROBADO' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockAvance)
      });

      const resultado = await app.obtenerAvanceEstudiante('222222222');
      expect(resultado).toEqual(mockAvance);
    });

    test('debe obtener avance con filtro de carrera', async () => {
      const mockAvance = [{ course: 'TEST-001', status: 'APROBADO' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockAvance)
      });

      const resultado = await app.obtenerAvanceEstudiante('222222222', '8266');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/estudiantes/222222222/avance?carrera=8266'
      );
      expect(resultado).toEqual(mockAvance);
    });

    test('debe retornar array vacío en caso de 404', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const resultado = await app.obtenerAvanceEstudiante('222222222', '8266');
      expect(resultado).toEqual([]);
    });

    test('debe manejar errores de red', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const resultado = await app.obtenerAvanceEstudiante('222222222');
      expect(resultado).toEqual([]);
    });
  });

  describe('construirCarrera', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
    });

    test('debe usar carrera seleccionada si existe', () => {
      app.carreraSeleccionada = {
        codigo: '8266',
        nombre: 'ITI',
        catalogo: '202410'
      };

      const usuario = { rut: '222222222' };
      const carrera = app.construirCarrera(usuario);

      expect(carrera.codigo).toBe('8266');
      expect(carrera.nombre).toBe('ITI');
      expect(carrera.catalogo).toBe('202410');
    });

    test('debe usar primera carrera del usuario si no hay selección', () => {
      app.carreraSeleccionada = null;
      const usuario = {
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI', catalogo: '202410' }]
      };

      const carrera = app.construirCarrera(usuario);
      expect(carrera.codigo).toBe('8266');
    });

    test('debe usar carrera como string si es string', () => {
      app.carreraSeleccionada = null;
      const usuario = {
        rut: '222222222',
        carreras: ['ITI']
      };

      const carrera = app.construirCarrera(usuario);
      expect(carrera.nombre).toBe('ITI');
    });

    test('debe usar academicInfo si no hay carreras', () => {
      app.carreraSeleccionada = null;
      const usuario = {
        rut: '222222222',
        carreras: [],
        academicInfo: {
          career: 'ITI',
          catalog: '202410'
        }
      };

      const carrera = app.construirCarrera(usuario);
      expect(carrera.nombre).toBe('ITI');
      expect(carrera.catalogo).toBe('202410');
    });
  });

  describe('construirCarga', () => {
    beforeEach(() => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        email: 'test@example.com',
        name: 'Test User',
        estudianteId: 1,
        carreras: []
      }));
      app = new SimulacionProxSemestreApp();
      app.ramosSeleccionados = new Set(['DCCB-00106', 'DCCB-00107']);
      global.window.DATOS_MALLA_ACTUAL = [
        { codigo: 'DCCB-00106', asignatura: 'CÁLCULO I', nivel: 1, creditos: 6, prereq: '' },
        { codigo: 'DCCB-00107', asignatura: 'ÁLGEBRA I', nivel: 1, creditos: 6, prereq: '' }
      ];
    });

    test('debe construir carga con ramos seleccionados', () => {
      const usuario = {
        rut: '222222222',
        email: 'test@example.com',
        name: 'Test User',
        estudianteId: 1,
        carreras: []
      };

      app.carreraSeleccionada = {
        codigo: '8266',
        nombre: 'ITI',
        catalogo: '202410'
      };

      const carga = app.construirCarga(usuario);

      expect(carga.tipo).toBe('simulacion_siguiente_semestre');
      expect(carga.estudiante.rut).toBe('222222222');
      expect(carga.carrera.codigo).toBe('8266');
      expect(carga.ramosDisponibles).toBeDefined();
      expect(carga.ramosSeleccionados).toBeDefined();
    });
  });

  describe('mostrarMensajeRamos', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
    });

    test('debe mostrar mensaje en contenedor', () => {
      app.mostrarMensajeRamos('No hay ramos disponibles');
      expect(mockRamosContainer.innerHTML).toContain('No hay ramos disponibles');
    });
  });

  describe('renderizarRamosAdelantables', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
      app.ramosAdelantables = [
        { codigo: 'TEST-001', nombre: 'Test 1', nivel: 1, creditos: 6 },
        { codigo: 'TEST-002', nombre: 'Test 2', nivel: 2, creditos: 8 }
      ];
    });

    test('debe renderizar ramos adelantables', () => {
      app.renderizarRamosAdelantables();
      expect(mockRamosContainer.innerHTML).toContain('TEST-001');
      expect(mockRamosContainer.innerHTML).toContain('TEST-002');
    });
  });

  describe('manejarSeleccion', () => {
    beforeEach(() => {
      app = new SimulacionProxSemestreApp();
      app.ramosAdelantables = [
        { codigo: 'TEST-001', nombre: 'Test 1', nivel: 1, creditos: 6 }
      ];
      app.renderizarRamosAdelantables();
    });

    test('debe agregar ramo al seleccionar', () => {
      const checkbox = mockRamosContainer.querySelector('input[type="checkbox"]');
      checkbox.checked = true;
      const event = { target: checkbox };
      app.manejarSeleccion(event);
      expect(app.ramosSeleccionados.has('TEST-001')).toBe(true);
    });

    test('debe remover ramo al deseleccionar', () => {
      app.ramosSeleccionados.add('TEST-001');
      const checkbox = mockRamosContainer.querySelector('input[type="checkbox"]');
      checkbox.checked = false;
      const event = { target: checkbox };
      app.manejarSeleccion(event);
      expect(app.ramosSeleccionados.has('TEST-001')).toBe(false);
    });
  });

  describe('actualizarContador', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="ramosCounter">
          <span class="count"></span>
        </div>
      `;
      app = new SimulacionProxSemestreApp();
      app.ramosCounter = document.getElementById('ramosCounter');
    });

    test('debe mostrar contador cuando hay selección', () => {
      app.ramosSeleccionados.add('TEST-001');
      app.actualizarContador();
      expect(app.ramosCounter.style.display).toBe('inline-flex');
    });

    test('debe ocultar contador cuando no hay selección', () => {
      app.ramosSeleccionados.clear();
      app.actualizarContador();
      expect(app.ramosCounter.style.display).toBe('none');
    });
  });

  describe('cargarRamosAdelantables', () => {
    beforeEach(() => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        email: 'test@example.com',
        carreras: [{ codigo: '8266', nombre: 'ITI', catalogo: '202410' }]
      }));
      app = new SimulacionProxSemestreApp();
      app.carreraSeleccionada = { codigo: '8266', catalogo: '202410' };
      global.window.obtenerMallas = jest.fn().mockResolvedValue([
        { codigo: 'TEST-001', asignatura: 'Test', nivel: 1, creditos: 6, prereq: '' }
      ]);
    });

    test('debe mostrar mensaje si no hay usuario', async () => {
      sessionStorage.clear();
      await app.cargarRamosAdelantables();
      expect(mockRamosContainer.innerHTML).toContain('Debes iniciar sesión');
    });

    test('debe mostrar mensaje si no hay carrera seleccionada con múltiples carreras', async () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '333333333',
        carreras: [
          { codigo: '8266', nombre: 'ITI' },
          { codigo: '8616', nombre: 'ICI' }
        ]
      }));
      app = new SimulacionProxSemestreApp();
      app.carreraSeleccionada = null;
      await app.cargarRamosAdelantables();
      expect(mockRamosContainer.innerHTML).toContain('selecciona una carrera');
    });

    test('debe cargar malla desde API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([])
      });
      await app.cargarRamosAdelantables();
      expect(global.window.obtenerMallas).toHaveBeenCalled();
    });
  });

  describe('configurarEventos', () => {
    beforeEach(() => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '333333333',
        carreras: [
          { codigo: '8266', nombre: 'ITI', catalogo: '202410' },
          { codigo: '8616', nombre: 'ICI', catalogo: '202310' }
        ]
      }));
      app = new SimulacionProxSemestreApp();
    });

    test('debe manejar cambio de carrera sin valor', () => {
      const event = { target: { value: '' } };
      mockSelectorCarrera.dispatchEvent(new Event('change'));
      expect(app.carreraSeleccionada).toBeDefined();
    });

    test('debe manejar carrera no encontrada en cambio', () => {
      mockSelectorCarrera.value = '9999';
      const event = new Event('change', { bubbles: true });
      mockSelectorCarrera.dispatchEvent(event);
      expect(app.ramosSeleccionados.size).toBe(0);
    });
  });

  describe('generar', () => {
    beforeEach(() => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        email: 'test@example.com',
        name: 'Test User',
        estudianteId: 1,
        carreras: []
      }));
      app = new SimulacionProxSemestreApp();
      app.ramosSeleccionados = new Set(['TEST-001']);
      global.window.DATOS_MALLA_ACTUAL = [
        { codigo: 'TEST-001', asignatura: 'Test', nivel: 1, creditos: 6, prereq: '' }
      ];
      app.carreraSeleccionada = { codigo: '8266', nombre: 'ITI', catalogo: '202410' };
    });

    test('debe mostrar alert si no hay ramos seleccionados', async () => {
      app.ramosSeleccionados.clear();
      window.alert = jest.fn();
      await app.generar();
      expect(window.alert).toHaveBeenCalled();
    });

    test('debe mostrar alert si no hay carrera', async () => {
      app.carreraSeleccionada = null;
      window.alert = jest.fn();
      await app.generar();
      expect(window.alert).toHaveBeenCalled();
    });

    test('debe generar simulación correctamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          mensaje: 'Simulación creada',
          simulacion: { id: 1 }
        })
      });

      await app.generar();
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar error al generar', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      window.alert = jest.fn();
      await app.generar();
      expect(window.alert).toHaveBeenCalled();
    });

    test('debe manejar respuesta con error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          error: 'Error al generar',
          detalle: 'Detalle del error'
        })
      });
      window.alert = jest.fn();
      await app.generar();
      expect(window.alert).toHaveBeenCalled();
    });

    test('debe manejar respuesta sin detalle', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          error: 'Error al generar'
        })
      });
      window.alert = jest.fn();
      await app.generar();
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('mostrarResultado', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="resultadoSimulacion"></div>
      `;
      sessionStorage.setItem('ucn_user_data', JSON.stringify({
        rut: '222222222',
        carreras: []
      }));
      app = new SimulacionProxSemestreApp();
      app.resultado = document.getElementById('resultadoSimulacion');
    });

    test('debe mostrar resultado con enlace de descarga', () => {
      const res = {
        mensaje: 'Simulación creada',
        simulacion: { id: 1 }
      };
      app.mostrarResultado(res);
      expect(app.resultado.innerHTML).toContain('Simulación creada');
      expect(app.resultado.innerHTML).toContain('Descargar JSON');
    });

    test('debe mostrar resultado con enlace relativo', () => {
      const res = {
        mensaje: 'Simulación creada',
        simulacion: { enlace_json: '/api/simulaciones/1/archivo' }
      };
      app.mostrarResultado(res);
      expect(app.resultado.innerHTML).toContain('Descargar JSON');
    });

    test('debe mostrar resultado sin enlace', () => {
      const res = {
        mensaje: 'Simulación creada',
        simulacion: {}
      };
      app.mostrarResultado(res);
      expect(app.resultado.innerHTML).toContain('Simulación creada');
    });
  });

  describe('actualizarEstado', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="botonProbarSimulacion">Generar</button>
        <div id="estadoSimulacion"></div>
      `;
      app = new SimulacionProxSemestreApp();
      app.btn = document.getElementById('botonProbarSimulacion');
      app.estado = document.getElementById('estadoSimulacion');
    });

    test('debe actualizar estado bloqueado', () => {
      app.actualizarEstado(true, 'Generando...');
      expect(app.btn.disabled).toBe(true);
      expect(app.estado.textContent).toBe('Generando...');
    });

    test('debe actualizar estado desbloqueado', () => {
      app.actualizarEstado(false, 'Listo');
      expect(app.btn.disabled).toBe(false);
      expect(app.estado.textContent).toBe('Listo');
    });

    test('debe usar texto por defecto', () => {
      app.actualizarEstado(true);
      expect(app.estado.textContent).toBe('Generando…');
    });
  });
});

