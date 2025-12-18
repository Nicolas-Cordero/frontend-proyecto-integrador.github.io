global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;

// mock toast to avoid runtime calls
global.toast = {
  error: jest.fn(),
  success: jest.fn(),
  loading: jest.fn(() => 'id'),
  remove: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
};

const { LoginApp, Utils, CONFIGURACION } = require('../js/index-script.js');

describe('Utils', () => {
  test('formatearFecha devuelve string', () => {
    const s = Utils.formatearFecha(new Date('2020-01-02'));
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(0);
  });

  test('debounce ejecuta la función tras timeout', (done) => {
    const fn = jest.fn();
    const d = Utils.debounce(fn, 50);
    d();
    expect(fn).not.toHaveBeenCalled();
    setTimeout(() => {
      expect(fn).toHaveBeenCalled();
      done();
    }, 80);
  });
});

describe('LoginApp (parcial)', () => {
  test('validarNombreUsuario valida emails y usernames', () => {
    const app = new LoginApp();
    expect(app.validarNombreUsuario('abc')).toBe(true);
    expect(app.validarNombreUsuario('ab')).toBe(false);
    expect(app.validarNombreUsuario('test@example.com')).toBe(true);
    expect(app.validarNombreUsuario('invalid@')).toBe(false);
  });

  test('validarContrasena respeta longitud mínima', () => {
    const app = new LoginApp();
    expect(app.validarContrasena('123')).toBe(true);
    expect(app.validarContrasena('12')).toBe(false);
  });

  test('mostrarCarga muestra y oculta elementos correctamente', () => {
    const btn = document.createElement('button');
    btn.id = 'botonLogin';
    const texto = document.createElement('span');
    texto.className = 'texto-boton';
    btn.appendChild(texto);
    const carga = document.createElement('div');
    carga.className = 'carga-boton';
    carga.style.display = 'none';
    btn.appendChild(carga);
    document.body.appendChild(btn);

    const overlay = document.createElement('div');
    overlay.id = 'superposicionCarga';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);

    const app = new LoginApp();
    app.mostrarCarga(true);
    expect(btn.disabled).toBe(true);
    expect(texto.style.display).toBe('none');
    expect(carga.style.display).toBe('flex');
    expect(overlay.style.display).toBe('flex');

    app.mostrarCarga(false);
    expect(btn.disabled).toBe(false);
  });
});
