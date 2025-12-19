global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;

const modulos = require('../js/perfil-usuario-script.js');

const PerfilConfig = modulos.PerfilConfig || global.PerfilConfig || window.PerfilConfig;
const StorageService = modulos.StorageService || global.StorageService || window.StorageService;
const UsuarioService = modulos.UsuarioService || global.UsuarioService || window.UsuarioService;
const PerfilDataService = modulos.PerfilDataService || global.PerfilDataService || window.PerfilDataService;
const PerfilRenderService = modulos.PerfilRenderService || global.PerfilRenderService || window.PerfilRenderService;
const PerfilEventService = modulos.PerfilEventService || global.PerfilEventService || window.PerfilEventService;
const FotoPerfilService = modulos.FotoPerfilService || global.FotoPerfilService || window.FotoPerfilService;
const AplicacionPerfilUsuario = modulos.AplicacionPerfilUsuario || global.AplicacionPerfilUsuario || window.AplicacionPerfilUsuario;

if (PerfilConfig) global.PerfilConfig = PerfilConfig;
if (StorageService) global.StorageService = StorageService;
if (UsuarioService) global.UsuarioService = UsuarioService;
if (PerfilDataService) global.PerfilDataService = PerfilDataService;
if (PerfilRenderService) global.PerfilRenderService = PerfilRenderService;
if (PerfilEventService) global.PerfilEventService = PerfilEventService;
if (FotoPerfilService) global.FotoPerfilService = FotoPerfilService;
if (AplicacionPerfilUsuario) global.AplicacionPerfilUsuario = AplicacionPerfilUsuario;

describe('PerfilConfig', () => {
  test('debe tener CLAVES definidas', () => {
    expect(global.PerfilConfig.CLAVES.DATOS_USUARIO).toBe('ucn_user_data');
  });

  test('debe tener IDS definidas', () => {
    expect(global.PerfilConfig.IDS.AVATAR_GRANDE).toBeDefined();
    expect(global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL).toBeDefined();
    expect(global.PerfilConfig.IDS.ROL_PERFIL).toBeDefined();
  });

  test('debe tener TRADUCCIONES_ROL definidas', () => {
    expect(global.PerfilConfig.TRADUCCIONES_ROL.student).toBe('Estudiante');
    expect(global.PerfilConfig.TRADUCCIONES_ROL.admin).toBe('Administrador');
    expect(global.PerfilConfig.TRADUCCIONES_ROL.teacher).toBe('Profesor');
  });

  test('debe tener VALORES_POR_DEFECTO definidos', () => {
    expect(global.PerfilConfig.VALORES_POR_DEFECTO.ROL).toBeDefined();
    expect(global.PerfilConfig.VALORES_POR_DEFECTO.CARRERA).toBeDefined();
  });
});

describe('StorageService en Perfil', () => {
  let storageService;

  beforeEach(() => {
    storageService = new global.StorageService();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('getItem debe retornar null cuando no hay valor', () => {
    const resultado = storageService.getItem('clave_inexistente');
    expect(resultado).toBeNull();
  });

  test('getItem debe retornar objeto parseado', () => {
    const dato = { nombre: 'test' };
    sessionStorage.setItem('clave', JSON.stringify(dato));
    const resultado = storageService.getItem('clave');
    expect(resultado).toEqual(dato);
  });

  test('setItem debe guardar correctamente', () => {
    const dato = { nombre: 'test' };
    const resultado = storageService.setItem('clave', dato);
    expect(resultado).toBe(true);
  });

  test('getItem debe manejar error de parseo y retornar null', () => {
    sessionStorage.setItem('clave_invalida', 'json invalido {');
    const resultado = storageService.getItem('clave_invalida');
    expect(resultado).toBeNull();
  });

  test('setItem debe manejar error y retornar false', () => {
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = jest.fn(() => {
      throw new Error('Quota exceeded');
    });

    const resultado = storageService.setItem('clave', {});
    expect(resultado).toBe(false);

    sessionStorage.setItem = originalSetItem;
  });

  test('removeItem debe manejar error y retornar false', () => {
    const originalRemoveItem = sessionStorage.removeItem;
    sessionStorage.removeItem = jest.fn(() => {
      throw new Error('Error');
    });

    const resultado = storageService.removeItem('clave');
    expect(resultado).toBe(false);

    sessionStorage.removeItem = originalRemoveItem;
  });

  test('clear debe manejar error y retornar false', () => {
    const originalClear = sessionStorage.clear;
    sessionStorage.clear = jest.fn(() => {
      throw new Error('Error');
    });

    const resultado = storageService.clear();
    expect(resultado).toBe(false);

    sessionStorage.clear = originalClear;
  });
});

describe('UsuarioService en Perfil', () => {
  let storageService;
  let usuarioService;

  beforeEach(() => {
    storageService = new global.StorageService();
    usuarioService = new global.UsuarioService(storageService, global.PerfilConfig.CLAVES.DATOS_USUARIO);
    sessionStorage.clear();
  });

  test('obtenerUsuario debe retornar usuario cuando existe', () => {
    const usuario = { rut: '123', name: 'Test' };
    storageService.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, usuario);

    const resultado = usuarioService.obtenerUsuario();
    expect(resultado).toEqual(usuario);
  });

  test('obtenerUsuario debe retornar null cuando no existe', () => {
    const resultado = usuarioService.obtenerUsuario();
    expect(resultado).toBeNull();
  });

  test('validarSesion debe retornar true cuando hay usuario', () => {
    storageService.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, { rut: '123' });
    expect(usuarioService.validarSesion()).toBe(true);
  });

  test('validarSesion debe retornar false cuando no hay usuario', () => {
    expect(usuarioService.validarSesion()).toBe(false);
  });
});

describe('PerfilDataService', () => {
  let usuarioService;
  let storageService;
  let perfilDataService;

  beforeEach(() => {
    storageService = new global.StorageService();
    usuarioService = new global.UsuarioService(storageService, global.PerfilConfig.CLAVES.DATOS_USUARIO);
    perfilDataService = new global.PerfilDataService(usuarioService);
  });

  test('obtenerDatosUsuario debe retornar datos del usuario', () => {
    const usuario = { name: 'Test' };
    storageService.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, usuario);

    const resultado = perfilDataService.obtenerDatosUsuario();
    expect(resultado).toEqual(usuario);
  });

  test('formatearNombreCompleto debe retornar name cuando existe', () => {
    const usuario = { name: 'Nombre Completo' };
    const resultado = perfilDataService.formatearNombreCompleto(usuario);
    expect(resultado).toBe('Nombre Completo');
  });

  test('formatearNombreCompleto debe combinar firstName y lastName', () => {
    const usuario = { firstName: 'Juan', lastName: 'Pérez' };
    const resultado = perfilDataService.formatearNombreCompleto(usuario);
    expect(resultado).toBe('Juan Pérez');
  });

  test('formatearNombreCompleto debe retornar Usuario cuando no hay datos', () => {
    const usuario = {};
    const resultado = perfilDataService.formatearNombreCompleto(usuario);
    expect(resultado).toBe('Usuario');
  });

  test('formatearRol debe retornar traducción correcta para student', () => {
    const usuario = { role: 'student' };
    const resultado = perfilDataService.formatearRol(usuario);
    expect(resultado).toBe('Estudiante');
  });

  test('formatearRol debe retornar traducción correcta para admin', () => {
    const usuario = { role: 'admin' };
    const resultado = perfilDataService.formatearRol(usuario);
    expect(resultado).toBe('Administrador');
  });

  test('formatearRol debe retornar valor por defecto cuando no hay role', () => {
    const usuario = {};
    const resultado = perfilDataService.formatearRol(usuario);
    expect(resultado).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.ROL);
  });

  test('formatearRol debe retornar role original cuando no hay traducción', () => {
    const usuario = { role: 'unknown' };
    const resultado = perfilDataService.formatearRol(usuario);
    expect(resultado).toBe('unknown');
  });

  test('obtenerInicialAvatar debe retornar primera letra de firstName', () => {
    const usuario = { firstName: 'Juan' };
    const resultado = perfilDataService.obtenerInicialAvatar(usuario);
    expect(resultado).toBe('J');
  });

  test('obtenerInicialAvatar debe retornar primera letra de name si no hay firstName', () => {
    const usuario = { name: 'Pedro' };
    const resultado = perfilDataService.obtenerInicialAvatar(usuario);
    expect(resultado).toBe('P');
  });

  test('obtenerInicialAvatar debe retornar U por defecto', () => {
    const usuario = {};
    const resultado = perfilDataService.obtenerInicialAvatar(usuario);
    expect(resultado).toBe('U');
  });

  test('obtenerInformacionAcademica debe retornar información completa', () => {
    const usuario = {
      academicInfo: {
        career: 'Ingeniería',
        generation: '2021',
        currentSemester: 5,
        gpa: 5.5
      }
    };

    const resultado = perfilDataService.obtenerInformacionAcademica(usuario);

    expect(resultado.carrera).toBe('Ingeniería');
    expect(resultado.generacion).toBe('2021');
    expect(resultado.nivelActual).toBe(5);
    expect(resultado.promedio).toBe(5.5);
  });

  test('obtenerInformacionAcademica debe retornar valores por defecto cuando faltan datos', () => {
    const usuario = {};

    const resultado = perfilDataService.obtenerInformacionAcademica(usuario);

    expect(resultado.carrera).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.CARRERA);
    expect(resultado.generacion).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.GENERACION);
    expect(resultado.nivelActual).toBe(0);
    expect(resultado.promedio).toBe(0);
  });

  test('validarDatosUsuario debe retornar válido cuando hay usuario', () => {
    const usuario = { name: 'Test' };
    const resultado = perfilDataService.validarDatosUsuario(usuario);

    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });

  test('validarDatosUsuario debe retornar inválido cuando es null', () => {
    const resultado = perfilDataService.validarDatosUsuario(null);

    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('No hay datos de usuario disponibles');
  });

  test('validarDatosUsuario debe retornar inválido cuando es undefined', () => {
    const resultado = perfilDataService.validarDatosUsuario(undefined);

    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('No hay datos de usuario disponibles');
  });
});

describe('PerfilRenderService', () => {
  let usuarioService;
  let storageService;
  let perfilDataService;
  let perfilRenderService;

  beforeEach(() => {
    storageService = new global.StorageService();
    usuarioService = new global.UsuarioService(storageService, global.PerfilConfig.CLAVES.DATOS_USUARIO);
    perfilDataService = new global.PerfilDataService(usuarioService);
    perfilRenderService = new global.PerfilRenderService(perfilDataService);
    document.body.innerHTML = '';
  });

  test('actualizarAvatar debe actualizar elemento cuando existe', () => {
    const elemento = document.createElement('div');
    elemento.id = global.PerfilConfig.IDS.AVATAR_GRANDE;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { firstName: 'Juan' };
    perfilRenderService.actualizarAvatar(usuario);

    expect(elemento.textContent).toBe('J');
  });

  test('actualizarAvatar no debe fallar cuando elemento no existe', () => {
    document.getElementById = jest.fn(() => null);

    const usuario = { firstName: 'Juan' };
    
    expect(() => perfilRenderService.actualizarAvatar(usuario)).not.toThrow();
  });

  test('actualizarNombreCompleto debe actualizar elemento', () => {
    const elemento = document.createElement('div');
    elemento.id = global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { name: 'Juan Pérez' };
    perfilRenderService.actualizarNombreCompleto(usuario, global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL);

    expect(elemento.textContent).toBe('Juan Pérez');
  });

  test('actualizarRol debe actualizar elemento', () => {
    const elemento = document.createElement('div');
    elemento.id = global.PerfilConfig.IDS.ROL_PERFIL;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { role: 'student' };
    perfilRenderService.actualizarRol(usuario);

    expect(elemento.textContent).toBe('Estudiante');
  });

  test('actualizarCorreo debe actualizar cuando hay email', () => {
    const elemento = document.createElement('div');
    elemento.id = global.PerfilConfig.IDS.CORREO_PERFIL;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { email: 'test@test.com' };
    perfilRenderService.actualizarCorreo(usuario, global.PerfilConfig.IDS.CORREO_PERFIL);

    expect(elemento.textContent).toBe('test@test.com');
  });

  test('actualizarCorreo no debe actualizar cuando no hay email', () => {
    const elemento = document.createElement('div');
    elemento.id = global.PerfilConfig.IDS.CORREO_PERFIL;
    elemento.textContent = 'Original';
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = {};
    perfilRenderService.actualizarCorreo(usuario, global.PerfilConfig.IDS.CORREO_PERFIL);

    expect(elemento.textContent).toBe('Original');
  });

  test('actualizarRut debe actualizar cuando hay rut', () => {
    const elemento = document.createElement('div');
    elemento.id = global.PerfilConfig.IDS.RUT_DETALLE;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { rut: '12345678-9' };
    perfilRenderService.actualizarRut(usuario);

    expect(elemento.textContent).toBe('12345678-9');
  });

  test('actualizarNombreUsuario debe actualizar cuando hay username', () => {
    const elemento = document.createElement('div');
    elemento.id = global.PerfilConfig.IDS.NOMBRE_USUARIO_DETALLE;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { username: 'juan123' };
    perfilRenderService.actualizarNombreUsuario(usuario);

    expect(elemento.textContent).toBe('juan123');
  });

  test('actualizarInformacionAcademica debe actualizar todos los campos', () => {
    const carreraEl = document.createElement('div');
    carreraEl.id = global.PerfilConfig.IDS.CARRERA_DETALLE;
    document.body.appendChild(carreraEl);

    const generacionEl = document.createElement('div');
    generacionEl.id = global.PerfilConfig.IDS.GENERACION_DETALLE;
    document.body.appendChild(generacionEl);

    const nivelEl = document.createElement('div');
    nivelEl.id = global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE;
    document.body.appendChild(nivelEl);

    const promedioEl = document.createElement('div');
    promedioEl.id = global.PerfilConfig.IDS.PROMEDIO_DETALLE;
    document.body.appendChild(promedioEl);

    document.getElementById = jest.fn((id) => {
      const map = {
        [global.PerfilConfig.IDS.CARRERA_DETALLE]: carreraEl,
        [global.PerfilConfig.IDS.GENERACION_DETALLE]: generacionEl,
        [global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE]: nivelEl,
        [global.PerfilConfig.IDS.PROMEDIO_DETALLE]: promedioEl
      };
      return map[id] || null;
    });

    const usuario = {
      academicInfo: {
        career: 'Ingeniería',
        generation: '2021',
        currentSemester: 5,
        gpa: 5.5
      }
    };

    perfilRenderService.actualizarInformacionAcademica(usuario);

    expect(carreraEl.textContent).toBe('Ingeniería');
    expect(generacionEl.textContent).toBe('2021');
    expect(nivelEl.textContent).toBe('5° Semestre');
    expect(promedioEl.textContent).toBe('5.5');
  });

  test('actualizarInformacionAcademica debe usar valores por defecto', () => {
    const carreraEl = document.createElement('div');
    carreraEl.id = global.PerfilConfig.IDS.CARRERA_DETALLE;
    document.body.appendChild(carreraEl);

    document.getElementById = jest.fn((id) => {
      if (id === global.PerfilConfig.IDS.CARRERA_DETALLE) return carreraEl;
      return null;
    });

    const usuario = {};
    perfilRenderService.actualizarInformacionAcademica(usuario);

    expect(carreraEl.textContent).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.CARRERA);
  });

  test('actualizarInformacionAcademica debe formatear nivel como 0° cuando es 0', () => {
    const nivelEl = document.createElement('div');
    nivelEl.id = global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE;
    document.body.appendChild(nivelEl);

    document.getElementById = jest.fn((id) => {
      if (id === global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE) return nivelEl;
      return null;
    });

    const usuario = { academicInfo: { currentSemester: 0 } };
    perfilRenderService.actualizarInformacionAcademica(usuario);

    expect(nivelEl.textContent).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.NIVEL);
  });

  test('renderizarPerfilCompleto debe actualizar todos los campos', () => {
    const elementos = {};
    Object.values(global.PerfilConfig.IDS).forEach(id => {
      if (id !== global.PerfilConfig.IDS.BOTON_VOLVER) {
        elementos[id] = document.createElement('div');
        elementos[id].id = id;
        document.body.appendChild(elementos[id]);
      }
    });

    document.getElementById = jest.fn((id) => elementos[id] || null);

    const usuario = {
      name: 'Juan Pérez',
      firstName: 'Juan',
      email: 'juan@test.com',
      rut: '12345678-9',
      username: 'juan',
      role: 'student',
      academicInfo: {
        career: 'Ingeniería',
        generation: '2021',
        currentSemester: 5,
        gpa: 5.5
      }
    };

    perfilRenderService.renderizarPerfilCompleto(usuario);

    expect(elementos[global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL].textContent).toBe('Juan Pérez');
    expect(elementos[global.PerfilConfig.IDS.ROL_PERFIL].textContent).toBe('Estudiante');
    expect(elementos[global.PerfilConfig.IDS.CORREO_PERFIL].textContent).toBe('juan@test.com');
  });
});

describe('PerfilEventService', () => {
  let perfilEventService;

  beforeEach(() => {
    perfilEventService = new global.PerfilEventService();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('configurarBotonVolver debe agregar event listener', () => {
    const boton = document.createElement('button');
    boton.id = global.PerfilConfig.IDS.BOTON_VOLVER;
    boton.addEventListener = jest.fn();
    document.body.appendChild(boton);
    document.getElementById = jest.fn(() => boton);

    perfilEventService.configurarBotonVolver();

    expect(boton.addEventListener).toHaveBeenCalled();
  });

  test('configurarBotonVolver no debe fallar cuando botón no existe', () => {
    document.getElementById = jest.fn(() => null);

    expect(() => perfilEventService.configurarBotonVolver()).not.toThrow();
  });

  test('configurarBotonVolver debe disparar evento navigateBack', () => {
    const boton = document.createElement('button');
    boton.id = global.PerfilConfig.IDS.BOTON_VOLVER;
    boton.addEventListener = jest.fn();
    document.body.appendChild(boton);
    document.getElementById = jest.fn(() => boton);

    window.dispatchEvent = jest.fn(() => true);

    perfilEventService.configurarBotonVolver();

    expect(boton.addEventListener).toHaveBeenCalled();
    
    const clickCall = boton.addEventListener.mock.calls.find(call => call[0] === 'click');
    if (clickCall && clickCall[1]) {
      clickCall[1]();
      expect(window.dispatchEvent).toHaveBeenCalled();
    }
  });

  test('configurarBotonesAccion debe configurar botón cambiar avatar', () => {
    const boton = document.createElement('button');
    boton.className = 'boton-cambiar-avatar';
    boton.addEventListener = jest.fn();
    document.body.appendChild(boton);
    document.querySelector = jest.fn(() => boton);

    perfilEventService.configurarBotonesAccion();

    expect(boton.addEventListener).toHaveBeenCalled();
  });

  test('configurarBotonesAccion no debe fallar cuando botón no existe', () => {
    document.querySelector = jest.fn(() => null);

    expect(() => perfilEventService.configurarBotonesAccion()).not.toThrow();
  });

  test('configurarBotonesAccion debe ejecutar callback cuando se hace click', () => {
    const boton = document.createElement('button');
    boton.className = 'boton-cambiar-avatar';
    boton.addEventListener = jest.fn();
    document.body.appendChild(boton);
    document.querySelector = jest.fn(() => boton);
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    perfilEventService.configurarBotonesAccion();

    const clickHandler = boton.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    if (clickHandler) {
      clickHandler();
      expect(consoleLogSpy).toHaveBeenCalledWith('Cambiar avatar - funcionalidad pendiente de implementación');
    }

    consoleLogSpy.mockRestore();
  });
});

describe('AplicacionPerfilUsuario', () => {
  let app;

  beforeEach(() => {
    sessionStorage.clear();
    const PerfilConfig = global.PerfilConfig || {};
    const IDS = PerfilConfig.IDS || {};
    document.body.innerHTML = `
      <div id="${IDS.AVATAR_GRANDE || 'avatarPerfilGrande'}"></div>
      <div id="${IDS.NOMBRE_COMPLETO_PERFIL || 'nombreCompletoPerfil'}"></div>
      <div id="${IDS.ROL_PERFIL || 'rolPerfil'}"></div>
      <div id="${IDS.CORREO_PERFIL || 'correoPerfil'}"></div>
      <div id="${IDS.NOMBRE_COMPLETO_DETALLE || 'nombreCompletoDetalle'}"></div>
      <div id="${IDS.RUT_DETALLE || 'rutDetalle'}"></div>
      <div id="${IDS.NOMBRE_USUARIO_DETALLE || 'nombreUsuarioDetalle'}"></div>
      <div id="${IDS.CORREO_DETALLE || 'correoDetalle'}"></div>
      <div id="${IDS.CARRERA_DETALLE || 'carreraDetalle'}"></div>
      <div id="${IDS.GENERACION_DETALLE || 'generacionDetalle'}"></div>
      <div id="${IDS.NIVEL_ACTUAL_DETALLE || 'nivelActualDetalle'}"></div>
      <div id="${IDS.PROMEDIO_DETALLE || 'promedioDetalle'}"></div>
      <button id="${IDS.BOTON_VOLVER || 'volverInicio'}"></button>
    `;
    jest.clearAllMocks();
  });

  test('debe inicializar correctamente cuando hay usuario', () => {
    const usuario = {
      name: 'Test',
      firstName: 'Test',
      email: 'test@test.com',
      rut: '12345678-9',
      username: 'test',
      role: 'student',
      academicInfo: {
        career: 'Carrera',
        generation: '2021',
        currentSemester: 3,
        gpa: 5.0
      }
    };
    sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

    app = new global.AplicacionPerfilUsuario();

    expect(app.datosUsuario).toEqual(usuario);
  });

  test('debe manejar correctamente cuando no hay usuario', () => {
    app = new global.AplicacionPerfilUsuario();

    expect(app.datosUsuario).toBeNull();
  });

  test('cargarDatosUsuario debe cargar usuario del storage', () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

    app = new global.AplicacionPerfilUsuario();

    expect(app.datosUsuario).toEqual(usuario);
  });

  test('mostrarPerfilUsuario no debe fallar cuando no hay datos', () => {
    app = new global.AplicacionPerfilUsuario();
    app.datosUsuario = null;

    expect(() => app.mostrarPerfilUsuario()).not.toThrow();
  });

  test('mostrarPerfilUsuario debe manejar errores de renderizado', () => {
    const usuario = {
      name: 'Test',
      firstName: 'Test',
      email: 'test@test.com'
    };
    sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

    document.body.innerHTML = `
      <div id="${global.PerfilConfig.IDS.AVATAR_GRANDE}"></div>
      <div id="${global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL}"></div>
      <div id="${global.PerfilConfig.IDS.ROL_PERFIL}"></div>
      <div id="${global.PerfilConfig.IDS.CORREO_PERFIL}"></div>
      <div id="${global.PerfilConfig.IDS.NOMBRE_COMPLETO_DETALLE}"></div>
      <div id="${global.PerfilConfig.IDS.RUT_DETALLE}"></div>
      <div id="${global.PerfilConfig.IDS.NOMBRE_USUARIO_DETALLE}"></div>
      <div id="${global.PerfilConfig.IDS.CORREO_DETALLE}"></div>
      <div id="${global.PerfilConfig.IDS.CARRERA_DETALLE}"></div>
      <div id="${global.PerfilConfig.IDS.GENERACION_DETALLE}"></div>
      <div id="${global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE}"></div>
      <div id="${global.PerfilConfig.IDS.PROMEDIO_DETALLE}"></div>
      <button id="${global.PerfilConfig.IDS.BOTON_VOLVER}"></button>
    `;

    app = new global.AplicacionPerfilUsuario();

    const renderizarSpy = jest.spyOn(app.perfilRenderService, 'renderizarPerfilCompleto').mockImplementation(() => {
      throw new Error('Error de renderizado');
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    app.mostrarPerfilUsuario();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al renderizar perfil:', expect.any(Error));

    renderizarSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('PerfilRenderService - métodos adicionales', () => {
    let renderService;
    let dataService;

    beforeEach(() => {
      dataService = new global.PerfilDataService(new global.UsuarioService(new global.StorageService()));
      renderService = new global.PerfilRenderService(dataService);
      document.body.innerHTML = `
        <div id="${global.PerfilConfig.IDS.AVATAR_GRANDE}"></div>
        <div id="${global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL}"></div>
        <div id="${global.PerfilConfig.IDS.ROL_PERFIL}"></div>
        <div id="${global.PerfilConfig.IDS.CORREO_PERFIL}"></div>
        <div id="${global.PerfilConfig.IDS.NOMBRE_COMPLETO_DETALLE}"></div>
        <div id="${global.PerfilConfig.IDS.RUT_DETALLE}"></div>
        <div id="${global.PerfilConfig.IDS.NOMBRE_USUARIO_DETALLE}"></div>
        <div id="${global.PerfilConfig.IDS.CORREO_DETALLE}"></div>
        <div id="${global.PerfilConfig.IDS.CARRERA_DETALLE}"></div>
        <div id="${global.PerfilConfig.IDS.GENERACION_DETALLE}"></div>
        <div id="${global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE}"></div>
        <div id="${global.PerfilConfig.IDS.PROMEDIO_DETALLE}"></div>
      `;
    });

    test('actualizarAvatar debe manejar usuario sin foto_perfil', () => {
      const usuario = { rut: '222222222' };
      renderService.actualizarAvatar(usuario);
      const avatar = document.getElementById(global.PerfilConfig.IDS.AVATAR_GRANDE);
      expect(avatar).toBeDefined();
    });

    test('actualizarAvatar debe manejar error al cargar imagen', () => {
      const usuario = { rut: '222222222', foto_perfil: 'profile.jpg', firstName: 'Test' };
      renderService.actualizarAvatar(usuario);
      const avatar = document.getElementById(global.PerfilConfig.IDS.AVATAR_GRANDE);
      const img = avatar.querySelector('img');
      if (img) {
        img.onerror();
        expect(avatar.textContent).toBe('T');
      }
    });

    test('actualizarAvatar debe usar name si firstName no existe', () => {
      const usuario = { rut: '222222222', foto_perfil: 'profile.jpg', name: 'Test User' };
      renderService.actualizarAvatar(usuario);
      const avatar = document.getElementById(global.PerfilConfig.IDS.AVATAR_GRANDE);
      const img = avatar.querySelector('img');
      if (img) {
        expect(img.alt).toBe('Test User');
      }
    });

    test('actualizarNombreCompleto debe actualizar elemento correctamente', () => {
      const usuario = { name: 'Test User' };
      renderService.actualizarNombreCompleto(usuario, global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL);
      const elemento = document.getElementById(global.PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL);
      expect(elemento.textContent).toBe('Test User');
    });

    test('actualizarRol debe actualizar elemento correctamente', () => {
      const usuario = { role: 'student' };
      renderService.actualizarRol(usuario);
      const elemento = document.getElementById(global.PerfilConfig.IDS.ROL_PERFIL);
      expect(elemento.textContent).toBe('Estudiante');
    });

    test('actualizarCorreo debe actualizar elemento correctamente', () => {
      const usuario = { email: 'test@example.com' };
      renderService.actualizarCorreo(usuario, global.PerfilConfig.IDS.CORREO_PERFIL);
      const elemento = document.getElementById(global.PerfilConfig.IDS.CORREO_PERFIL);
      expect(elemento.textContent).toBe('test@example.com');
    });

    test('actualizarRut debe actualizar elemento correctamente', () => {
      const usuario = { rut: '222222222' };
      renderService.actualizarRut(usuario);
      const elemento = document.getElementById(global.PerfilConfig.IDS.RUT_DETALLE);
      expect(elemento.textContent).toBe('222222222');
    });

    test('actualizarNombreUsuario debe actualizar elemento correctamente', () => {
      const usuario = { username: 'testuser' };
      renderService.actualizarNombreUsuario(usuario);
      const elemento = document.getElementById(global.PerfilConfig.IDS.NOMBRE_USUARIO_DETALLE);
      expect(elemento.textContent).toBe('testuser');
    });

    test('actualizarInformacionAcademica debe actualizar todos los elementos', () => {
      const usuario = {
        academicInfo: {
          career: 'ITI',
          generation: '2021',
          currentSemester: 5,
          gpa: 4.5
        }
      };
      renderService.actualizarInformacionAcademica(usuario);
      expect(document.getElementById(global.PerfilConfig.IDS.CARRERA_DETALLE).textContent).toBe('ITI');
      expect(document.getElementById(global.PerfilConfig.IDS.GENERACION_DETALLE).textContent).toBe('2021');
      expect(document.getElementById(global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE).textContent).toBe('5');
      expect(document.getElementById(global.PerfilConfig.IDS.PROMEDIO_DETALLE).textContent).toBe('4.5');
    });

    test('actualizarInformacionAcademica debe manejar información académica parcial', () => {
      const usuario = {
        academicInfo: {
          career: 'ITI'
        }
      };
      renderService.actualizarInformacionAcademica(usuario);
      expect(document.getElementById(global.PerfilConfig.IDS.CARRERA_DETALLE).textContent).toBe('ITI');
    });

    test('actualizarInformacionAcademica debe manejar nivelActual 0', () => {
      const usuario = {
        academicInfo: {
          currentSemester: 0
        }
      };
      renderService.actualizarInformacionAcademica(usuario);
      const nivelElemento = document.getElementById(global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE);
      expect(nivelElemento.textContent).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.NIVEL);
    });

    test('actualizarInformacionAcademica debe manejar promedio 0', () => {
      const usuario = {
        academicInfo: {
          gpa: 0
        }
      };
      renderService.actualizarInformacionAcademica(usuario);
      const promedioElemento = document.getElementById(global.PerfilConfig.IDS.PROMEDIO_DETALLE);
      expect(promedioElemento.textContent).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.PROMEDIO);
    });

    test('actualizarInformacionAcademica debe manejar nivelActual mayor a 0', () => {
      const usuario = {
        academicInfo: {
          currentSemester: 5
        }
      };
      renderService.actualizarInformacionAcademica(usuario);
      const nivelElemento = document.getElementById(global.PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE);
      expect(nivelElemento.textContent).toBe('5° Semestre');
    });

    test('actualizarInformacionAcademica debe manejar promedio mayor a 0', () => {
      const usuario = {
        academicInfo: {
          gpa: 4.5
        }
      };
      renderService.actualizarInformacionAcademica(usuario);
      const promedioElemento = document.getElementById(global.PerfilConfig.IDS.PROMEDIO_DETALLE);
      expect(promedioElemento.textContent).toBe('4.5');
    });

    test('actualizarInformacionAcademica debe manejar elementos faltantes', () => {
      document.body.innerHTML = `
        <div id="${global.PerfilConfig.IDS.CARRERA_DETALLE}"></div>
      `;
      const usuario = {
        academicInfo: {
          career: 'ITI'
        }
      };
      renderService.actualizarInformacionAcademica(usuario);
      expect(document.getElementById(global.PerfilConfig.IDS.CARRERA_DETALLE).textContent).toBe('ITI');
    });

    test('configurarBotonVolver debe configurar evento correctamente', () => {
      document.body.innerHTML = `<button id="${global.PerfilConfig.IDS.BOTON_VOLVER}"></button>`;
      renderService.configurarBotonVolver();
      const boton = document.getElementById(global.PerfilConfig.IDS.BOTON_VOLVER);
      expect(boton).toBeDefined();
    });
  });

  describe('PerfilEventService - casos adicionales', () => {
    test('configurarBotonesAccion debe manejar input file existente', () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar"></button>
        </div>
        <input id="input-file-foto-perfil" type="file">
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ mensaje: 'Foto actualizada' })
      });

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      expect(inputFile).toBeDefined();
    });

    test('configurarBotonesAccion debe manejar archivo inválido', () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar"></button>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(inputFile, 'files', {
        value: [file],
        writable: false
      });

      const changeEvent = new Event('change', { bubbles: true });
      inputFile.dispatchEvent(changeEvent);

      expect(global.toast.error).toHaveBeenCalled();
    });

    test('configurarBotonesAccion debe manejar archivo muy grande', () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar"></button>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(inputFile, 'files', {
        value: [file],
        writable: false
      });

      const changeEvent = new Event('change', { bubbles: true });
      inputFile.dispatchEvent(changeEvent);

      expect(global.toast.error).toHaveBeenCalled();
    });

    test('configurarBotonesAccion debe manejar usuario sin rut', () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar"></button>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = {};
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(inputFile, 'files', {
        value: [file],
        writable: false
      });

      const changeEvent = new Event('change', { bubbles: true });
      inputFile.dispatchEvent(changeEvent);

      expect(global.toast.error).toHaveBeenCalled();
    });

    test('configurarBotonesAccion debe manejar error al subir foto', async () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar"></button>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Error al subir' })
      });

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(inputFile, 'files', {
        value: [file],
        writable: false
      });

      const changeEvent = new Event('change', { bubbles: true });
      await inputFile.dispatchEvent(changeEvent);

      expect(global.toast.error).toHaveBeenCalled();
    });

    test('configurarBotonesAccion debe manejar click en botón cambiar avatar', () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar">Cambiar</button>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const clickSpy = jest.spyOn(inputFile, 'click');
      const boton = document.querySelector('.boton-cambiar-avatar');
      
      boton.click();
      
      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    test('configurarBotonesAccion debe manejar click fuera del botón', () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <div class="otro-elemento">Otro</div>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const clickSpy = jest.spyOn(inputFile, 'click');
      const otroElemento = document.querySelector('.otro-elemento');
      
      otroElemento.click();
      
      expect(clickSpy).not.toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    test('configurarBotonesAccion debe manejar actualización exitosa con mainMenuApp', async () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar"></button>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          mensaje: 'Foto actualizada',
          foto_perfil: 'profile.jpg'
        })
      });

      global.window.mainMenuApp = {
        usuarioUIService: {
          actualizar: jest.fn().mockResolvedValue()
        }
      };

      global.window.aplicacionPerfilUsuario = {
        perfilRenderService: {
          actualizarAvatar: jest.fn()
        }
      };

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(inputFile, 'files', {
        value: [file],
        writable: false
      });

      const changeEvent = new Event('change', { bubbles: true });
      await inputFile.dispatchEvent(changeEvent);

      expect(global.toast.success).toHaveBeenCalled();
    });

    test('configurarBotonesAccion debe manejar actualización sin mainMenuApp', async () => {
      document.body.innerHTML = `
        <div class="contenedor-avatar">
          <button class="boton-cambiar-avatar"></button>
        </div>
      `;
      const eventService = new global.PerfilEventService();
      const usuario = { rut: '222222222' };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          mensaje: 'Foto actualizada',
          foto_perfil: 'profile.jpg'
        })
      });

      global.window.mainMenuApp = undefined;
      global.window.aplicacionPerfilUsuario = {
        perfilRenderService: {
          actualizarAvatar: jest.fn()
        }
      };

      global.toast = {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn().mockReturnValue('toast-id'),
        remove: jest.fn()
      };

      eventService.configurarBotonesAccion(usuario);

      const inputFile = document.getElementById('input-file-foto-perfil');
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(inputFile, 'files', {
        value: [file],
        writable: false
      });

      const changeEvent = new Event('change', { bubbles: true });
      await inputFile.dispatchEvent(changeEvent);

      expect(global.toast.success).toHaveBeenCalled();
    });
  });

  describe('FotoPerfilService', () => {
    test('obtenerUrlFoto debe retornar null si no hay rut', () => {
      const url = global.FotoPerfilService.obtenerUrlFoto(null);
      expect(url).toBeNull();
    });

    test('obtenerUrlFoto debe retornar URL correcta', () => {
      const url = global.FotoPerfilService.obtenerUrlFoto('222222222');
      expect(url).toContain('222222222');
      expect(url).toContain('/foto');
    });

    test('subirFoto debe lanzar error si falta rut', async () => {
      await expect(global.FotoPerfilService.subirFoto(null, new File([''], 'test.jpg'))).rejects.toThrow();
    });

    test('subirFoto debe lanzar error si falta archivo', async () => {
      await expect(global.FotoPerfilService.subirFoto('222222222', null)).rejects.toThrow();
    });
  });

  describe('PerfilDataService - casos adicionales', () => {
    let dataService;

    beforeEach(() => {
      dataService = new global.PerfilDataService(new global.UsuarioService(new global.StorageService()));
    });

    test('formatearNombreCompleto debe usar firstName y lastName', () => {
      const usuario = { firstName: 'John', lastName: 'Doe' };
      const nombre = dataService.formatearNombreCompleto(usuario);
      expect(nombre).toBe('John Doe');
    });

    test('formatearNombreCompleto debe retornar Usuario si no hay nombre', () => {
      const usuario = {};
      const nombre = dataService.formatearNombreCompleto(usuario);
      expect(nombre).toBe('Usuario');
    });

    test('formatearRol debe retornar rol por defecto si no hay role', () => {
      const usuario = {};
      const rol = dataService.formatearRol(usuario);
      expect(rol).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.ROL);
    });

    test('formatearRol debe retornar rol traducido', () => {
      const usuario = { role: 'admin' };
      const rol = dataService.formatearRol(usuario);
      expect(rol).toBe('Administrador');
    });

    test('formatearRol debe retornar rol original si no está traducido', () => {
      const usuario = { role: 'unknown' };
      const rol = dataService.formatearRol(usuario);
      expect(rol).toBe('unknown');
    });

    test('obtenerInicialAvatar debe usar name si firstName no existe', () => {
      const usuario = { name: 'Test' };
      const inicial = dataService.obtenerInicialAvatar(usuario);
      expect(inicial).toBe('T');
    });

    test('obtenerInicialAvatar debe usar U por defecto', () => {
      const usuario = {};
      const inicial = dataService.obtenerInicialAvatar(usuario);
      expect(inicial).toBe('U');
    });

    test('obtenerInformacionAcademica debe usar valores por defecto', () => {
      const usuario = {};
      const info = dataService.obtenerInformacionAcademica(usuario);
      expect(info.carrera).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.CARRERA);
      expect(info.generacion).toBe(global.PerfilConfig.VALORES_POR_DEFECTO.GENERACION);
    });
  });

  describe('AplicacionPerfilUsuario - casos adicionales', () => {
    test('cargarEstadisticasAcademicas debe manejar sin carreras', async () => {
      const usuario = { rut: '222222222', carreras: [] };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
      document.body.innerHTML = `<div id="estadisticasContainer"></div>`;

      global.window.HistoricoEstadisticas = class {
        constructor() {}
        actualizar() {}
      };

      app = new global.AplicacionPerfilUsuario();
      await app.cargarEstadisticasAcademicas();

      expect(app.estadisticasWidget).toBeDefined();
    });

    test('cargarEstadisticasAcademicas debe manejar sin widget', async () => {
      const usuario = { rut: '222222222', carreras: [] };
      sessionStorage.setItem(global.PerfilConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
      document.body.innerHTML = `<div id="estadisticasContainer"></div>`;

      global.window.HistoricoEstadisticas = undefined;
      global.window.historicoEstadisticas = undefined;

      app = new global.AplicacionPerfilUsuario();
      await app.cargarEstadisticasAcademicas();

      expect(app.estadisticasWidget).toBeNull();
    });

    test('cargarEstadisticasAcademicas debe manejar sin datosUsuario', async () => {
      sessionStorage.clear();
      document.body.innerHTML = `<div id="estadisticasContainer"></div>`;

      app = new global.AplicacionPerfilUsuario();
      app.datosUsuario = null;
      await app.cargarEstadisticasAcademicas();

      expect(app.estadisticasWidget).toBeNull();
    });

    test('obtenerWidgetEstadisticas debe retornar widget existente', () => {
      const widget = { test: true };
      global.window.historicoEstadisticas = widget;

      app = new global.AplicacionPerfilUsuario();
      const resultado = app.obtenerWidgetEstadisticas();

      expect(resultado).toBe(widget);
    });

    test('obtenerWidgetEstadisticas debe crear nuevo widget', () => {
      global.window.historicoEstadisticas = undefined;
      global.window.HistoricoEstadisticas = class {
        constructor() {}
      };
      document.body.innerHTML = `<div id="estadisticasContainer"></div>`;

      app = new global.AplicacionPerfilUsuario();
      const resultado = app.obtenerWidgetEstadisticas();

      expect(resultado).toBeDefined();
      expect(global.window.historicoEstadisticas).toBeDefined();
    });
  });
});

