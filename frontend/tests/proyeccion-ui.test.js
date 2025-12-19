global.window = global;

describe('renderizarProyeccion', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="contenedorMalla"></div>';
    require('../js/proyeccion-ui.js');
  });

  test('muestra mensaje cuando no hay datos', () => {
    const cont = document.getElementById('contenedorMalla');
    window.renderizarProyeccion(null);
    expect(cont.textContent).toContain('No hay datos de proyecciones');
  });

  test('renderiza columnas y ramos no posibles', () => {
    const proyeccion = {
      semestres: [
        [{ codigo: 'A', asignatura: 'A', creditos: 3 }],
        [{ codigo: 'B', asignatura: 'B', creditos: 4 }]
      ],
      ramosReqNoPosibles: [{ codigo: 'X', asignatura: 'X', creditos: 2 }]
    };

    window.renderizarProyeccion(proyeccion, 'contenedorMalla');

    const cont = document.getElementById('contenedorMalla');
    expect(cont.querySelectorAll('.columna').length).toBe(2);
    expect(cont.querySelector('.ramos-no-posibles')).toBeTruthy();
    // verificar que los nodos contienen créditos y nombre
    expect(cont.querySelector('.ramo .meta-ramo').textContent).toContain('(3cr)');
    expect(cont.querySelector('.titulo-col').textContent).toContain('SEMESTRE 1');
  });
});
