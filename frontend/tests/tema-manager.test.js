global.window = global;
global.document = document;

const fs = require('fs');
const vm = require('vm');
const path = require('path');

describe('TemaManager', () => {
  beforeEach(() => {
    // clean localStorage and document element
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  test('aplicarTema y obtenerTemaActual funcionan', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'tema-manager.js'), 'utf8');
    // run in global context so top-level declarations become globals
    // provide a minimal matchMedia implementation in context
    const context = { window: global, document, localStorage };
    context.window.matchMedia = (q) => ({ matches: false });
    vm.runInNewContext(code, context);

    // temaManager may not be attached to window; try to construct
    const TemaManager = global.TemaManager || (typeof TemaManager !== 'undefined' ? TemaManager : null);
    expect(typeof TemaManager === 'function' || global.temaManager).toBeTruthy();

    const manager = global.temaManager || new TemaManager();
    manager.aplicarTema('dark');
    expect(manager.obtenerTemaActual()).toBe('dark');
    expect(localStorage.getItem('app-theme')).toBe('dark');

    manager.alternarTema();
    expect(['light','dark']).toContain(manager.obtenerTemaActual());
  });
});
