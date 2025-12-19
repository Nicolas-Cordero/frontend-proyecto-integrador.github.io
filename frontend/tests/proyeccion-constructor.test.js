global.window = global;

describe('crearProyeccion', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Load the module to register function
    require('../js/proyeccion-constructor.js');
  });

  test('genera semestres con límite de créditos y actualiza sessionStorage', () => {
    // Mock helpers
    window.puedeAgregarRamo = jest.fn().mockReturnValue(true);
    window.cabeEnSemestre = jest.fn((ramo, actuales, max) => (actuales + (ramo.creditos || 0) <= max));

    const pendientes = [
      { codigo: 'A', creditos: 3, nivel: 1 },
      { codigo: 'B', creditos: 3, nivel: 1 },
      { codigo: 'C', creditos: 3, nivel: 2 }
    ];

    const aprobados = [];

    const res = window.crearProyeccion(pendientes, aprobados, 6);

    expect(res.totalSemestres).toBeGreaterThan(0);
    expect(res.totalRamos).toBe(3);

    const stored = JSON.parse(sessionStorage.getItem('proyeccionEgresoActual'));
    expect(stored.totalRamos).toBe(res.totalRamos);
  });

  test('coloca ramos no posibles cuando no cumplen requisitos', () => {
    window.puedeAgregarRamo = jest.fn((ramo) => ramo.codigo !== 'X');
    window.cabeEnSemestre = jest.fn().mockReturnValue(true);

    const pendientes = [
      { codigo: 'X', creditos: 3, nivel: 1 },
      { codigo: 'Y', creditos: 3, nivel: 2 }
    ];

    const aprobados = [];

    const res = window.crearProyeccion(pendientes, aprobados, 6);

    expect(res.ramosReqNoPosibles).toEqual(expect.arrayContaining([{ codigo: 'X', creditos: 3, nivel: 1 }]));
  });
});
