global.window = global;

describe('proyeccion-validador', () => {
  beforeEach(() => {
    jest.resetModules();
    require('../js/proyeccion-validador.js');
  });

  test('puedeAgregarRamo sin prereq retorna true', () => {
    expect(window.puedeAgregarRamo({ codigo: 'A' }, new Set())).toBe(true);
    expect(window.puedeAgregarRamo({ codigo: 'A', prereq: '' }, new Set())).toBe(true);
  });

  test('puedeAgregarRamo con prereqs verifica set', () => {
    const set = new Set(['X', 'Y']);
    const ramo = { codigo: 'A', prereq: 'X,Y' };
    expect(window.puedeAgregarRamo(ramo, set)).toBe(true);

    const set2 = new Set(['X']);
    expect(window.puedeAgregarRamo(ramo, set2)).toBe(false);
  });

  test('cabeEnSemestre funciona correctamente', () => {
    expect(window.cabeEnSemestre({ creditos: 6 }, 0, 6)).toBe(true);
    expect(window.cabeEnSemestre({ creditos: 7 }, 0, 6)).toBe(false);
    expect(window.cabeEnSemestre(null, 0, 6)).toBe(false);
    expect(window.cabeEnSemestre({ codigo: 'A' }, 0, 6)).toBe(false);
  });
});
