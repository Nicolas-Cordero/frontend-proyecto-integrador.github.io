global.window = global;

describe('procesarDatos', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('maneja entradas vacías', () => {
    require('../js/proyeccion-procesador.js');

    const res = window.procesarDatos(null, null);

    expect(res.ramosAprobados).toEqual([]);
    expect(res.ramosPendientes).toEqual([]);
    expect(res.codigosAprobados instanceof Set).toBe(true);
  });

  test('filtra aprobados y pendientes y ordena por periodo/nivel', () => {
    require('../js/proyeccion-procesador.js');

    const avance = [
      { period: '2023-2', course: 'A', status: 'APROBADO' },
      { period: '2022-1', course: 'B', status: 'reprobado' },
      { period: '2021-1', course: 'C', status: 'APROBADO' }
    ];

    const malla = [
      { codigo: 'A', nivel: 3 },
      { codigo: 'B', nivel: 1 },
      { codigo: 'D', nivel: 2 }
    ];

    const res = window.procesarDatos(avance, malla);

    expect(res.ramosAprobados.length).toBe(2);
    expect(res.codigosAprobados.has('A')).toBe(true);
    // B y D no están aprobados en el avance, y se ordenan por nivel (B nivel 1, D nivel 2)
    expect(res.ramosPendientes.map(r => r.codigo)).toEqual(['B','D']);
  });
});
