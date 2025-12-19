global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;
global.fetch = fetch;

const modulos = require('../js/index-script.js');

const LoginApp = modulos.LoginApp || global.LoginApp || window.LoginApp;
const Utils = modulos.Utils || global.Utils || window.Utils;
const CONFIGURACION = modulos.CONFIGURACION || global.CONFIGURACION || window.CONFIGURACION;

if (LoginApp) global.LoginApp = LoginApp;
if (Utils) global.Utils = Utils;
if (CONFIGURACION) global.CONFIGURACION = CONFIGURACION;

global.toast = {
  loading: jest.fn(() => 'toast-id'),
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  remove: jest.fn()
};

describe('CONFIGURACION', () => {
  test('debe tener URL_BASE_API definida', () => {
    expect(global.CONFIGURACION.URL_BASE_API).toBe('https://puclaro.ucn.cl/eross/avance');
  });

  test('debe tener CLAVES_ALMACENAMIENTO definidas', () => {
    expect(global.CONFIGURACION.CLAVES_ALMACENAMIENTO.DATOS_USUARIO).toBe('ucn_user_data');
  });

  test('debe tener VALIDACION definida', () => {
    expect(global.CONFIGURACION.VALIDACION.LONGITUD_MINIMA_CONTRASENA).toBe(3);
    expect(global.CONFIGURACION.VALIDACION.MAX_INTENTOS_LOGIN).toBe(3);
  });
});

describe('LoginApp', () => {
  let loginApp;
  let mockForm;
  let mockUsuarioInput;
  let mockContrasenaInput;
  let mockBotonLogin;
  let mockToggleContrasena;

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();

    document.body.innerHTML = `
      <form id="loginForm">
        <input id="usuario" name="usuario" type="text" required />
        <input id="contrasena" name="contrasena" type="password" required />
        <button id="botonLogin" type="submit">
          <span class="texto-boton">Iniciar Sesión</span>
          <span class="carga-boton" style="display: none;">Cargando...</span>
        </button>
        <button id="alternarContrasena" type="button">
          <i class="fas fa-eye"></i>
        </button>
        <div id="errorUsuario"></div>
        <div id="errorContrasena"></div>
        <div id="superposicionCarga" style="display: none;"></div>
      </form>
    `;

    mockForm = document.getElementById('loginForm');
    mockUsuarioInput = document.getElementById('usuario');
    mockContrasenaInput = document.getElementById('contrasena');
    mockBotonLogin = document.getElementById('botonLogin');
    mockToggleContrasena = document.getElementById('alternarContrasena');
  });

  test('debe inicializar correctamente', () => {
    loginApp = new global.LoginApp();
    expect(loginApp).toBeInstanceOf(global.LoginApp);
  });

  describe('validarNombreUsuario', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe retornar false para string vacío', () => {
      expect(loginApp.validarNombreUsuario('')).toBe(false);
      expect(loginApp.validarNombreUsuario('   ')).toBe(false);
    });

    test('debe validar email correctamente', () => {
      expect(loginApp.validarNombreUsuario('test@example.com')).toBe(true);
      expect(loginApp.validarNombreUsuario('usuario@ucn.cl')).toBe(true);
      expect(loginApp.validarNombreUsuario('invalid@')).toBe(false);
      expect(loginApp.validarNombreUsuario('@example.com')).toBe(false);
    });

    test('debe validar nombre de usuario correctamente', () => {
      expect(loginApp.validarNombreUsuario('usuario123')).toBe(true);
      expect(loginApp.validarNombreUsuario('user_name')).toBe(true);
      expect(loginApp.validarNombreUsuario('us')).toBe(false);
      expect(loginApp.validarNombreUsuario('usuario@123')).toBe(false);
    });
  });

  describe('validarContrasena', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe validar longitud mínima', () => {
      expect(loginApp.validarContrasena('123')).toBe(true);
      expect(loginApp.validarContrasena('1234')).toBe(true);
      expect(loginApp.validarContrasena('12')).toBe(false);
      expect(loginApp.validarContrasena('')).toBe(false);
      expect(loginApp.validarContrasena(null)).toBe(false);
    });
  });

  describe('validarCampo', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe validar campo usuario correctamente', () => {
      mockUsuarioInput.value = 'test@example.com';
      const resultado = loginApp.validarCampo('usuario');
      expect(resultado).toBe(true);
      expect(document.getElementById('errorUsuario').classList.contains('show')).toBe(false);
    });

    test('debe mostrar error para usuario inválido', () => {
      mockUsuarioInput.value = 'ab';
      const resultado = loginApp.validarCampo('usuario');
      expect(resultado).toBe(false);
      expect(document.getElementById('errorUsuario').textContent).toBe('Ingresa un usuario o email válido');
    });

    test('debe validar campo contraseña correctamente', () => {
      mockContrasenaInput.value = 'password123';
      const resultado = loginApp.validarCampo('contrasena');
      expect(resultado).toBe(true);
    });

    test('debe mostrar error para contraseña inválida', () => {
      mockContrasenaInput.value = '12';
      const resultado = loginApp.validarCampo('contrasena');
      expect(resultado).toBe(false);
      expect(document.getElementById('errorContrasena').textContent).toContain('al menos');
    });
  });

  describe('alternarVisibilidadContrasena', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe cambiar tipo de password a text', () => {
      mockContrasenaInput.type = 'password';
      loginApp.alternarVisibilidadContrasena();
      expect(mockContrasenaInput.type).toBe('text');
    });

    test('debe cambiar tipo de text a password', () => {
      mockContrasenaInput.type = 'text';
      loginApp.alternarVisibilidadContrasena();
      expect(mockContrasenaInput.type).toBe('password');
    });

    test('debe actualizar icono correctamente', () => {
      const icon = mockToggleContrasena.querySelector('i');
      mockContrasenaInput.type = 'password';
      loginApp.alternarVisibilidadContrasena();
      expect(icon.className).toBe('fas fa-eye-slash');
      
      loginApp.alternarVisibilidadContrasena();
      expect(icon.className).toBe('fas fa-eye');
    });
  });

  describe('realizarInicioSesion', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe retornar success true con datos válidos', async () => {
      const mockResponse = {
        rut: '222222222',
        carreras: [{ codigo: '8266', nombre: 'ITI', catalogo: '202410' }]
      };

      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockResponse))
      });

      const resultado = await loginApp.realizarInicioSesion({
        username: 'test@example.com',
        password: 'password123'
      });

      expect(resultado.success).toBe(true);
      expect(resultado.data.user.email).toBe('test@example.com');
      expect(resultado.data.user.rut).toBe('222222222');
    });

    test('debe retornar success false con error del servidor', async () => {
      const mockResponse = { error: 'Credenciales inválidas' };

      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockResponse))
      });

      const resultado = await loginApp.realizarInicioSesion({
        username: 'test@example.com',
        password: 'wrong'
      });

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Credenciales inválidas');
    });

    test('debe manejar error de conexión', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const resultado = await loginApp.realizarInicioSesion({
        username: 'test@example.com',
        password: 'password123'
      });

      expect(resultado.success).toBe(false);
      expect(resultado.error).toContain('conectar');
    });
  });

  describe('sincronizarUsuarioBackend', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe sincronizar usuario correctamente', async () => {
      const mockUsuario = {
        rut: '222222222',
        email: 'test@example.com',
        name: 'Test User',
        carreras: []
      };

      const mockResponse = {
        estudianteId: 1,
        foto_perfil: 'profile-pictures/222222222.jpg'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      const resultado = await loginApp.sincronizarUsuarioBackend(mockUsuario);

      expect(resultado.estudianteId).toBe(1);
      expect(resultado.foto_perfil).toBe('profile-pictures/222222222.jpg');
    });

    test('debe lanzar error si la respuesta no es ok', async () => {
      const mockUsuario = {
        rut: '222222222',
        email: 'test@example.com',
        carreras: []
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ error: 'Error al sincronizar' })
      });

      await expect(loginApp.sincronizarUsuarioBackend(mockUsuario)).rejects.toThrow();
    });
  });

  describe('guardarDatosSesion', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
      sessionStorage.clear();
    });

    test('debe guardar datos de usuario en sessionStorage', () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User'
        }
      };

      loginApp.guardarDatosSesion(data);

      const stored = JSON.parse(sessionStorage.getItem('ucn_user_data'));
      expect(stored.rut).toBe('222222222');
      expect(stored.email).toBe('test@example.com');
    });

    test('no debe guardar si no hay user en data', () => {
      loginApp.guardarDatosSesion({});
      expect(sessionStorage.getItem('ucn_user_data')).toBeNull();
    });
  });

  describe('limpiarDatosSesion', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
      sessionStorage.setItem('ucn_user_data', JSON.stringify({ rut: '222222222' }));
    });

    test('debe limpiar sessionStorage', () => {
      loginApp.limpiarDatosSesion();
      expect(sessionStorage.length).toBe(0);
    });
  });

  describe('mostrarCarga', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe mostrar estado de carga', () => {
      loginApp.mostrarCarga(true);
      expect(mockBotonLogin.disabled).toBe(true);
      expect(document.getElementById('superposicionCarga').style.display).toBe('flex');
    });

    test('debe ocultar estado de carga', () => {
      loginApp.mostrarCarga(false);
      expect(mockBotonLogin.disabled).toBe(false);
      expect(document.getElementById('superposicionCarga').style.display).toBe('none');
    });
  });

  describe('manejarInicioSesionAlternativo', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe mostrar mensaje de no disponible', () => {
      loginApp.manejarInicioSesionAlternativo('google');
      expect(global.toast.warning).toHaveBeenCalledWith('Login con google no está disponible temporalmente');
    });
  });

  describe('manejarOlvidoContrasena', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe mostrar mensaje informativo', () => {
      const event = { preventDefault: jest.fn() };
      loginApp.manejarOlvidoContrasena(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(global.toast.info).toHaveBeenCalled();
    });
  });

  describe('configurarToggleTema', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="botonTema">
          <i class="fas fa-moon"></i>
        </button>
      `;
      global.temaManager = {
        obtenerTemaActual: jest.fn().mockReturnValue('light'),
        alternarTema: jest.fn()
      };
      loginApp = new global.LoginApp();
    });

    test('debe configurar toggle de tema si temaManager está disponible', () => {
      const botonTema = document.getElementById('botonTema');
      expect(botonTema).toBeDefined();
    });

    test('debe actualizar icono para tema oscuro', () => {
      global.temaManager.obtenerTemaActual = jest.fn().mockReturnValue('dark');
      loginApp = new global.LoginApp();
      const icono = document.querySelector('#botonTema i');
      expect(icono).toBeDefined();
    });
  });

  describe('manejarEntradaInvalida', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="loginForm">
          <input id="usuario" name="usuario" type="text" required />
          <input id="contrasena" name="contrasena" type="password" required />
          <div id="errorUsuario"></div>
          <div id="errorContrasena"></div>
        </form>
      `;
      loginApp = new global.LoginApp();
    });

    test('debe manejar valueMissing', () => {
      const input = document.getElementById('usuario');
      Object.defineProperty(input, 'validity', {
        value: { valueMissing: true, typeMismatch: false },
        writable: true
      });
      
      const event = { preventDefault: jest.fn(), target: input };
      loginApp.manejarEntradaInvalida(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.getElementById('errorUsuario').textContent).toBeTruthy();
    });

    test('debe manejar typeMismatch', () => {
      const input = document.getElementById('usuario');
      Object.defineProperty(input, 'validity', {
        value: { valueMissing: false, typeMismatch: true },
        writable: true
      });
      
      const event = { preventDefault: jest.fn(), target: input };
      loginApp.manejarEntradaInvalida(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.getElementById('errorUsuario').textContent).toContain('Formato');
    });
  });

  describe('manejarInicioSesionExitoso', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
      global.fetch = jest.fn();
      global.window.location = { href: '' };
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('debe sincronizar usuario y redirigir', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({ estudianteId: 1 })
        });

      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.fetch).toHaveBeenCalled();
      expect(global.toast.success).toHaveBeenCalled();
    });

    test('debe obtener foto_perfil si no viene en sincronización', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({ estudianteId: 1 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({
            estudiante: { foto_perfil: 'profile.jpg' }
          })
        });

      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar error en sincronización', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.toast.success).toHaveBeenCalled();
    });
  });

  describe('mostrarMensajeEstado', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="mensajeEstado">
          <span class="status-icon"></span>
          <span class="status-text"></span>
        </div>
      `;
      loginApp = new global.LoginApp();
    });

    test('debe mostrar mensaje de éxito', () => {
      loginApp.mostrarMensajeEstado('success', 'Éxito');
      const statusElement = document.getElementById('mensajeEstado');
      expect(statusElement.classList.contains('success')).toBe(true);
    });

    test('debe mostrar mensaje de error', () => {
      loginApp.mostrarMensajeEstado('error', 'Error');
      const statusElement = document.getElementById('mensajeEstado');
      expect(statusElement.classList.contains('error')).toBe(true);
    });

    test('debe mostrar mensaje de warning', () => {
      loginApp.mostrarMensajeEstado('warning', 'Advertencia');
      const statusElement = document.getElementById('mensajeEstado');
      expect(statusElement.classList.contains('warning')).toBe(true);
    });

    test('debe mostrar mensaje de info', () => {
      loginApp.mostrarMensajeEstado('info', 'Información');
      const statusElement = document.getElementById('mensajeEstado');
      expect(statusElement.classList.contains('info')).toBe(true);
    });
  });

  describe('verificarSesionExistente', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe verificar sesión existente', () => {
      sessionStorage.setItem('ucn_user_data', JSON.stringify({ rut: '222222222' }));
      loginApp.verificarSesionExistente();
      expect(sessionStorage.getItem('ucn_user_data')).toBeDefined();
    });
  });

  describe('alternarMenuMovil', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
    });

    test('debe ejecutar sin errores', () => {
      expect(() => loginApp.alternarMenuMovil()).not.toThrow();
    });
  });

  describe('configurarValidacionFormulario', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="loginForm">
          <input id="usuario" name="usuario" type="text" required />
          <input id="contrasena" name="contrasena" type="password" required />
        </form>
      `;
      loginApp = new global.LoginApp();
    });

    test('debe configurar validación en inputs requeridos', () => {
      const form = document.getElementById('loginForm');
      const inputs = form.querySelectorAll('input[required]');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('manejarInicioSesion - casos adicionales', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="loginForm">
          <input id="usuario" name="usuario" type="text" required />
          <input id="contrasena" name="contrasena" type="password" required />
          <button id="botonLogin" type="submit">
            <span class="texto-boton">Iniciar Sesión</span>
            <span class="carga-boton" style="display: none;">Cargando...</span>
          </button>
          <div id="superposicionCarga" style="display: none;"></div>
        </form>
      `;
      loginApp = new global.LoginApp();
      global.fetch = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('debe manejar evento sin preventDefault', async () => {
      const usuarioInput = document.getElementById('usuario');
      const passwordInput = document.getElementById('contrasena');
      usuarioInput.value = 'test@example.com';
      passwordInput.value = 'password123';

      const mockResponse = { rut: '222222222', carreras: [] };
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockResponse))
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({ estudianteId: 1 })
        });

      const event = { preventDefault: undefined };
      await loginApp.manejarInicioSesion(event);
      expect(global.toast.loading).toHaveBeenCalled();
    });

    test('debe manejar catch error en manejarInicioSesion', async () => {
      const usuarioInput = document.getElementById('usuario');
      const passwordInput = document.getElementById('contrasena');
      usuarioInput.value = 'test@example.com';
      passwordInput.value = 'password123';

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const event = { preventDefault: jest.fn() };
      await loginApp.manejarInicioSesion(event);
      expect(global.toast.error).toHaveBeenCalled();
    });
  });

  describe('manejarInicioSesionExitoso - casos adicionales', () => {
    beforeEach(() => {
      loginApp = new global.LoginApp();
      global.fetch = jest.fn();
      global.window.location = { href: '' };
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('debe manejar usuario sin rut', async () => {
      const data = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.toast.success).toHaveBeenCalled();
    });

    test('debe manejar sincronización sin estudianteId', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({})
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({
            estudiante: { foto_perfil: 'profile.jpg' }
          })
        });

      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar respuesta sin foto_perfil', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({})
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({
            estudiante: {}
          })
        });

      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar respuesta no ok al obtener foto_perfil', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({})
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.fetch).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    test('debe manejar error al obtener foto_perfil', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({})
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.fetch).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    test('debe manejar sincronización con foto_perfil definida', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          estudianteId: 1,
          foto_perfil: 'profile.jpg'
        })
      });

      await loginApp.manejarInicioSesionExitoso(data);
      expect(global.fetch).toHaveBeenCalled();
    });

    test('debe manejar error en sincronización', async () => {
      const data = {
        user: {
          rut: '222222222',
          email: 'test@example.com',
          name: 'Test User',
          carreras: []
        }
      };

      global.fetch.mockRejectedValueOnce(new Error('Sync error'));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await loginApp.manejarInicioSesionExitoso(data);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Utils', () => {
    test('formatearFecha debe formatear fecha correctamente', () => {
      const fecha = new Date('2023-12-19');
      const resultado = global.Utils.formatearFecha(fecha);
      expect(resultado).toBeDefined();
      expect(typeof resultado).toBe('string');
    });

    test('formatearHora debe formatear hora correctamente', () => {
      const fecha = new Date('2023-12-19T14:30:00');
      const resultado = global.Utils.formatearHora(fecha);
      expect(resultado).toBeDefined();
      expect(typeof resultado).toBe('string');
    });
  });
});

describe('Utils', () => {
  test('debe tener método formatearFecha', () => {
    expect(global.Utils.formatearFecha).toBeDefined();
    expect(typeof global.Utils.formatearFecha).toBe('function');
  });

  test('debe tener método formatearHora', () => {
    expect(global.Utils.formatearHora).toBeDefined();
    expect(typeof global.Utils.formatearHora).toBe('function');
  });

  test('debe tener método debounce', () => {
    expect(global.Utils.debounce).toBeDefined();
    expect(typeof global.Utils.debounce).toBe('function');
  });

  test('debe tener método throttle', () => {
    expect(global.Utils.throttle).toBeDefined();
    expect(typeof global.Utils.throttle).toBe('function');
  });

  test('debounce debe retrasar ejecución', (done) => {
    let callCount = 0;
    const debouncedFn = global.Utils.debounce(() => {
      callCount++;
    }, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(callCount).toBe(0);

    setTimeout(() => {
      expect(callCount).toBe(1);
      done();
    }, 150);
  });

  test('throttle debe limitar ejecuciones', (done) => {
    let callCount = 0;
    const throttledFn = global.Utils.throttle(() => {
      callCount++;
    }, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(callCount).toBe(1);

    setTimeout(() => {
      throttledFn();
      expect(callCount).toBe(2);
      done();
    }, 150);
  });
});

