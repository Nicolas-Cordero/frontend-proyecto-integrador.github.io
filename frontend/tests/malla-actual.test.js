describe('MallaActualApp', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
  });

  test('debe exponer la clase y permitir instancia', () => {
    const mod = require('../js/malla-actual.js');
    const Cls = mod.MallaActualApp || global.MallaActualApp || window.MallaActualApp;

    expect(Cls).toBeDefined();

    const inst = new Cls();
    expect(inst).toBeInstanceOf(Cls);
  });
});
