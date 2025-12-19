global.window = global;

describe('mallas.js - selector y carga', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id="selectorCarreraMallaContainer" style="display:none;">
        <select id="selectCarreraMalla"></select>
      </div>
      <div id="contenedorMalla"></div>
    `;
    // mocks que el módulo usa
    window.renderizarMalla = jest.fn();
  });

  test('si hay múltiples carreras muestra selector y carga malla de la primera', async () => {
    const usuario = { carreras: [
      { codigo: 'C1', nombre: 'C1', catalogo: '202410' },
      { codigo: 'C2', nombre: 'C2', catalogo: '202320' }
    ] };

    sessionStorage.setItem('ucn_user_data', JSON.stringify(usuario));

    // mock obtenerMallas para cada codigo
    window.obtenerMallas = jest.fn()
      .mockResolvedValueOnce([{ codigo: 'X', asignatura: 'X', nivel: 1 }])
      .mockResolvedValueOnce([{ codigo: 'Y', asignatura: 'Y', nivel: 1 }]);

    // require ejecuta el IIFE y llama a inicializarSelectorCarrera
    require('../js/mallas.js');

    // esperar microtasks para que promesas internas se resuelvan
    await new Promise(r => setTimeout(r, 0));

    const selectorContainer = document.getElementById('selectorCarreraMallaContainer');
    const selector = document.getElementById('selectCarreraMalla');

    expect(selectorContainer.style.display).toBe('block');
    expect(selector.children.length).toBeGreaterThan(1);

    // Debió llamar a obtenerMallas para la primera carrera
    expect(window.obtenerMallas).toHaveBeenCalled();
    expect(window.renderizarMalla).toHaveBeenCalledWith(expect.any(Array));

    // Simular cambio de selector a segunda opción
    selector.value = 'C2';
    // dispatch event
    selector.dispatchEvent(new Event('change', { bubbles: true }));

    // esperar microtasks
    await new Promise(r => setTimeout(r, 0));

    // Ahora obtenerMallas fue llamado otra vez y renderizar también con los datos del mock
    expect(window.obtenerMallas).toHaveBeenCalledTimes(2);
    expect(window.renderizarMalla).toHaveBeenCalledTimes(2);
  });

  test('si sessionStorage no tiene datos usa inicializarMallas (fallback a DEFAULT)', async () => {
    sessionStorage.clear();

    // mock obtenerMallas global para inicializarMallas
    window.obtenerMallas = jest.fn().mockResolvedValueOnce(null);
    window.renderizarMalla = jest.fn();

    require('../js/mallas.js');

    await new Promise(r => setTimeout(r, 0));

    expect(window.renderizarMalla).toHaveBeenCalled();
  });
});
