global.window = global;

describe('mallas-ui renderizarMalla', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="contenedorMalla"></div>';
    console.error = jest.fn();
  });

  test('debe agrupar asignaturas por nivel y crear columnas ordenadas', () => {
    require('../js/mallas-ui.js');

    const malla = [
      { asignatura: 'A1', nivel: 2 },
      { asignatura: 'A2', nivel: 1 },
      { asignatura: 'A3', nivel: 2 }
    ];

    window.renderizarMalla(malla);

    const contenedor = document.getElementById('contenedorMalla');
    expect(contenedor.children.length).toBe(2); // SEMESTRE 1 y 2

    const h2Texts = Array.from(contenedor.querySelectorAll('h2')).map(h => h.textContent);
    expect(h2Texts).toEqual(['SEMESTRE 1', 'SEMESTRE 2']);

    const nombreRamos = Array.from(contenedor.querySelectorAll('.ramo')).map(r => r.textContent);
    expect(nombreRamos).toEqual(expect.arrayContaining(['A2', 'A1', 'A3']));

    // debe setear window.DATOS_MALLA_ACTUAL
    expect(window.DATOS_MALLA_ACTUAL).toBeDefined();
    expect(Array.isArray(window.DATOS_MALLA_ACTUAL)).toBe(true);
  });

  test('si no existe el contenedor debe escribir en consola error y no explotar', () => {
    document.body.innerHTML = '';
    require('../js/mallas-ui.js');

    expect(() => window.renderizarMalla([])).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});
