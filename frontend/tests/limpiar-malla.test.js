global.window = global;

describe('limpiarMalla', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    require('../js/limpiar-malla.js');
  });

  test('debe quitar prereqs inexistentes', () => {
    const ramos = [
      { codigo: 'A', asignatura: 'A', prereq: 'B,C' },
      { codigo: 'B', asignatura: 'B', prereq: '' },
      { codigo: 'D', asignatura: 'D', prereq: 'X' }
    ];

    const resultado = window.limpiarMalla(ramos);

    expect(resultado.find(r => r.codigo === 'A').prereq).toBe('B');
    expect(resultado.find(r => r.codigo === 'D').prereq).toBe('');
  });

  test('debe mantener campos esperados sin mutar referencias externas', () => {
    const ramos = [{ codigo: 'A', asignatura: 'A', prereq: '' }];
    const copia = JSON.parse(JSON.stringify(ramos));

    const resultado = window.limpiarMalla(ramos);

    expect(resultado[0].codigo).toBe('A');
    expect(ramos).toEqual(copia); // no muta entrada
  });
});
