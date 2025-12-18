global.window = global;
require('../js/proyeccion-validador.js');

describe('proyeccion-validador', () => {
  test('puedeAgregarRamo con prereq vacio o undefined', () => {
    expect(global.puedeAgregarRamo({ codigo: 'A' }, new Set())).toBe(true);
    expect(global.puedeAgregarRamo(null, new Set())).toBe(false);
  });

  test('puedeAgregarRamo con prereqs no cumplidos', () => {
    const ramo = { codigo: 'C', prereq: 'A,B' };
    const procesados = new Set(['A']);
    expect(global.puedeAgregarRamo(ramo, procesados)).toBe(false);
    procesados.add('B');
    expect(global.puedeAgregarRamo(ramo, procesados)).toBe(true);
  });

  test('cabeEnSemestre calcula correctamente', () => {
    expect(global.cabeEnSemestre({ creditos: 6 }, 0, 30)).toBe(true);
    expect(global.cabeEnSemestre({ creditos: 10 }, 25, 30)).toBe(false);
    expect(global.cabeEnSemestre(null, 0, 30)).toBe(false);
  });
});
