global.window = global;

let _origSetTimeout;

describe('ejecutarTesting', () => {
  beforeEach(() => {
    jest.resetModules();
    // For deterministic behavior, replace setTimeout to execute immediately
    _origSetTimeout = global.setTimeout;
    global.setTimeout = (fn, t) => { fn(); return 0; };

    document.body.innerHTML = '<div id="resultadoProyeccion"></div>';
    require('../js/proyeccion-trigger.js');
  });

  afterEach(() => {
    // restore original setTimeout
    global.setTimeout = _origSetTimeout;
  });

  test('ejecución exitosa llama a prepararProyeccion y renderizarProyeccion', async () => {
    const resultado = { semestres: [], ramosReqNoPosibles: [] };

    sessionStorage.setItem('ucn_user_data', JSON.stringify({ rut: '222', carreras: [{ codigo: 'C1', catalogo: '2024' }], estudianteId: 1, email: 'a@b' }));

    // prepare a controllable promise so we can resolve when ready
    let resolver;
    const prepPromise = new Promise(res => { resolver = res; });
    window.prepararProyeccion = jest.fn().mockImplementation(() => prepPromise);

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({}) });
    window.renderizarProyeccion = jest.fn();

    window.ejecutarTesting('C1', '2024', 30);

    // now resolve the prepararProyeccion promise and wait for the pipeline to finish
    resolver(resultado);

    await prepPromise;

    // wait (using original timer) for the rest of the pipeline (fetch, render) to complete
    await new Promise(resolve => {
      const start = Date.now();
      (function check() {
        if (window.renderizarProyeccion && window.renderizarProyeccion.mock && window.renderizarProyeccion.mock.calls.length) return resolve();
        if (Date.now() - start > 500) return resolve();
        _origSetTimeout(check, 5);
      })();
    });

    const div = document.getElementById('resultadoProyeccion');
    expect(window.prepararProyeccion).toHaveBeenCalled();
    expect(window.renderizarProyeccion).toHaveBeenCalledWith(resultado, 'resultadoProyeccion');
    expect(div.innerHTML).toContain('Proyección generada exitosamente');
  });

  test('muestra error cuando no hay usuario en sessionStorage', async () => {
    sessionStorage.clear();
    window.prepararProyeccion = jest.fn().mockResolvedValue({});
    window.renderizarProyeccion = jest.fn();

    window.ejecutarTesting('C1', '2024', 30);
    // setTimeout was replaced to execute immediately; wait for async callbacks to complete
    await Promise.resolve();
    await new Promise(r => setTimeout(r, 0));
    await Promise.resolve();

    const div = document.getElementById('resultadoProyeccion');
    expect(div.innerHTML).toContain('Error en la proyección');
    expect(window.renderizarProyeccion).not.toHaveBeenCalled();
  });
});
