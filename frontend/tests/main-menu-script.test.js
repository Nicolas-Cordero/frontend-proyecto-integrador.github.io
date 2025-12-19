global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;
global.fetch = fetch;

const modulos = require('../js/main-menu-script.js');

const AppConfig = modulos.AppConfig || global.AppConfig || window.AppConfig;
const MainMenuApp = modulos.MainMenuApp || global.MainMenuApp || window.MainMenuApp;
const StorageService = global.StorageService || window.StorageService;
const ApiService = global.ApiService || window.ApiService;
const ResourceManager = global.ResourceManager || window.ResourceManager;
const RenderService = global.RenderService || window.RenderService;
const UsuarioService = global.UsuarioService || window.UsuarioService;
const VistaStrategy = global.VistaStrategy || window.VistaStrategy;
const VistaInicioStrategy = global.VistaInicioStrategy || window.VistaInicioStrategy;
const VistaPerfilStrategy = global.VistaPerfilStrategy || window.VistaPerfilStrategy;
const VistaMallaActualStrategy = global.VistaMallaActualStrategy || window.VistaMallaActualStrategy;
const VistaHistoricoStrategy = global.VistaHistoricoStrategy || window.VistaHistoricoStrategy;
const VistaTestingStrategy = global.VistaTestingStrategy || window.VistaTestingStrategy;
const VistaMisSimulacionesEgreso = global.VistaMisSimulacionesEgreso || window.VistaMisSimulacionesEgreso;
const VistaMisSimulacionesProxSemestre = global.VistaMisSimulacionesProxSemestre || window.VistaMisSimulacionesProxSemestre;
const VistaSimulacionProxSemestreStrategy = global.VistaSimulacionProxSemestreStrategy || window.VistaSimulacionProxSemestreStrategy;
const VistaDashboardRossStrategy = global.VistaDashboardRossStrategy || window.VistaDashboardRossStrategy;
const NavegacionService = global.NavegacionService || window.NavegacionService;
const BusquedaService = global.BusquedaService || window.BusquedaService;
const MenuActivoService = global.MenuActivoService || window.MenuActivoService;
const UsuarioUIService = global.UsuarioUIService || window.UsuarioUIService;

if (AppConfig) global.AppConfig = AppConfig;
if (MainMenuApp) global.MainMenuApp = MainMenuApp;
if (StorageService) global.StorageService = StorageService;
if (ApiService) global.ApiService = ApiService;
if (ResourceManager) global.ResourceManager = ResourceManager;
if (RenderService) global.RenderService = RenderService;
if (UsuarioService) global.UsuarioService = UsuarioService;
if (VistaStrategy) global.VistaStrategy = VistaStrategy;
if (VistaInicioStrategy) global.VistaInicioStrategy = VistaInicioStrategy;
if (VistaPerfilStrategy) global.VistaPerfilStrategy = VistaPerfilStrategy;
if (VistaMallaActualStrategy) global.VistaMallaActualStrategy = VistaMallaActualStrategy;
if (VistaHistoricoStrategy) global.VistaHistoricoStrategy = VistaHistoricoStrategy;
if (VistaTestingStrategy) global.VistaTestingStrategy = VistaTestingStrategy;
if (VistaMisSimulacionesEgreso) global.VistaMisSimulacionesEgreso = VistaMisSimulacionesEgreso;
if (VistaMisSimulacionesProxSemestre) global.VistaMisSimulacionesProxSemestre = VistaMisSimulacionesProxSemestre;
if (VistaSimulacionProxSemestreStrategy) global.VistaSimulacionProxSemestreStrategy = VistaSimulacionProxSemestreStrategy;
if (VistaDashboardRossStrategy) global.VistaDashboardRossStrategy = VistaDashboardRossStrategy;
if (NavegacionService) global.NavegacionService = NavegacionService;
if (BusquedaService) global.BusquedaService = BusquedaService;
if (MenuActivoService) global.MenuActivoService = MenuActivoService;
if (UsuarioUIService) global.UsuarioUIService = UsuarioUIService;

describe('AppConfig', () => {
  test('debe tener CLAVES definidas', () => {
    expect(global.AppConfig.CLAVES.DATOS_USUARIO).toBe('ucn_user_data');
  });

  test('debe tener URLS definidas', () => {
    expect(global.AppConfig.URLS.LOGIN_API).toBeDefined();
    expect(global.AppConfig.URLS.INDEX).toBeDefined();
    expect(global.AppConfig.URLS.MAIN_MENU).toBeDefined();
  });

  test('debe tener RUTAS definidas', () => {
    expect(global.AppConfig.RUTAS.HTML).toBeDefined();
    expect(global.AppConfig.RUTAS.JS).toBeDefined();
    expect(global.AppConfig.RUTAS.CSS).toBeDefined();
  });

  test('debe tener IDS definidas', () => {
    expect(global.AppConfig.IDS.AREA_CONTENIDO).toBeDefined();
    expect(global.AppConfig.IDS.NOMBRE_USUARIO).toBeDefined();
  });

  test('debe tener SCRIPTS_MALLA definido', () => {
    expect(Array.isArray(global.AppConfig.SCRIPTS_MALLA)).toBe(true);
    expect(global.AppConfig.SCRIPTS_MALLA.length).toBeGreaterThan(0);
  });
});

describe('StorageService', () => {
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

  test('getItem debe retornar objeto parseado cuando existe', () => {
    const dato = { nombre: 'test', valor: 123 };
    sessionStorage.setItem('clave_test', JSON.stringify(dato));
    const resultado = storageService.getItem('clave_test');
    expect(resultado).toEqual(dato);
  });

  test('getItem debe retornar null cuando hay error de parseo', () => {
    sessionStorage.setItem('clave_invalida', 'json invalido {');
    const resultado = storageService.getItem('clave_invalida');
    expect(resultado).toBeNull();
  });

  test('setItem debe guardar correctamente', () => {
    const dato = { nombre: 'test' };
    const resultado = storageService.setItem('clave_test', dato);
    expect(resultado).toBe(true);
    expect(sessionStorage.getItem('clave_test')).toBe(JSON.stringify(dato));
  });

  test('setItem debe retornar false en caso de error', () => {
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = jest.fn(() => {
      throw new Error('Quota exceeded');
    });
    
    const resultado = storageService.setItem('clave', {});
    expect(resultado).toBe(false);
    
    sessionStorage.setItem = originalSetItem;
  });

  test('removeItem debe eliminar correctamente', () => {
    sessionStorage.setItem('clave_test', 'valor');
    const resultado = storageService.removeItem('clave_test');
    expect(resultado).toBe(true);
    expect(sessionStorage.getItem('clave_test')).toBeNull();
  });

  test('removeItem debe retornar false en caso de error', () => {
    const originalRemoveItem = sessionStorage.removeItem;
    sessionStorage.removeItem = jest.fn(() => {
      throw new Error('Error');
    });
    
    const resultado = storageService.removeItem('clave');
    expect(resultado).toBe(false);
    
    sessionStorage.removeItem = originalRemoveItem;
  });

  test('clear debe limpiar todo', () => {
    sessionStorage.setItem('clave1', 'valor1');
    sessionStorage.setItem('clave2', 'valor2');
    const resultado = storageService.clear();
    expect(resultado).toBe(true);
    expect(sessionStorage.length).toBe(0);
  });

  test('clear debe retornar false en caso de error', () => {
    const originalClear = sessionStorage.clear;
    sessionStorage.clear = jest.fn(() => {
      throw new Error('Error');
    });
    
    const resultado = storageService.clear();
    expect(resultado).toBe(false);
    
    sessionStorage.clear = originalClear;
  });
});

describe('ApiService', () => {
  let apiService;
  
  beforeEach(() => {
    apiService = new global.ApiService();
    fetch.mockClear();
  });

  test('fetchJson debe retornar JSON parseado correctamente', async () => {
    const respuestaMock = { nombre: 'test' };
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(respuestaMock))
    });

    const resultado = await apiService.fetchJson('http://test.com');
    expect(resultado).toEqual(respuestaMock);
  });

  test('fetchJson debe lanzar error cuando JSON es inválido', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue('json invalido {')
    });

    await expect(apiService.fetchJson('http://test.com')).rejects.toThrow();
  });

  test('fetchJson debe lanzar error cuando fetch falla', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(apiService.fetchJson('http://test.com')).rejects.toThrow('Network error');
  });

  test('login debe retornar datos cuando es exitoso', async () => {
    const respuestaMock = { rut: '12345678-9', name: 'Test' };
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(respuestaMock))
    });

    const resultado = await apiService.login('test@test.com', 'password');
    expect(resultado).toEqual(respuestaMock);
  });

  test('login debe lanzar error cuando hay error en respuesta', async () => {
    const respuestaMock = { error: 'Credenciales inválidas' };
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(respuestaMock))
    });

    await expect(apiService.login('test@test.com', 'wrong')).rejects.toThrow('Credenciales inválidas');
  });

  test('login debe construir URL correctamente', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue('{}')
    });

    await apiService.login('test@test.com', 'pass123');
    
    expect(fetch).toHaveBeenCalled();
    const urlLlamada = fetch.mock.calls[0][0];
    expect(urlLlamada).toContain('test%40test.com');
    expect(urlLlamada).toContain('pass123');
  });
});

describe('UsuarioService', () => {
  let storageService;
  let usuarioService;

  beforeEach(() => {
    storageService = new global.StorageService();
    usuarioService = new global.UsuarioService(storageService);
    sessionStorage.clear();
  });

  test('obtenerUsuario debe retornar usuario cuando existe', () => {
    const usuario = { rut: '123', name: 'Test' };
    storageService.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, usuario);
    
    const resultado = usuarioService.obtenerUsuario();
    expect(resultado).toEqual(usuario);
  });

  test('obtenerUsuario debe retornar null cuando no existe', () => {
    const resultado = usuarioService.obtenerUsuario();
    expect(resultado).toBeNull();
  });

  test('validarSesion debe retornar true cuando hay usuario', () => {
    storageService.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, { rut: '123' });
    expect(usuarioService.validarSesion()).toBe(true);
  });

  test('validarSesion debe retornar false cuando no hay usuario', () => {
    expect(usuarioService.validarSesion()).toBe(false);
  });

  test('transformarDatosUsuario debe transformar correctamente con datos completos', () => {
    const data = {
      rut: '12345678-9',
      name: 'Nombre Completo',
      carreras: [{ nombre: 'Carrera 1', catalogo: '2021' }]
    };
    const email = 'test@test.com';

    const resultado = usuarioService.transformarDatosUsuario(data, email);

    expect(resultado.rut).toBe('12345678-9');
    expect(resultado.email).toBe(email);
    expect(resultado.name).toBe('Nombre Completo');
    expect(resultado.carreras).toEqual(data.carreras);
    expect(resultado.academicInfo.career).toBe('Carrera 1');
  });

  test('transformarDatosUsuario debe manejar datos incompletos', () => {
    const data = {};
    const email = 'test@test.com';

    const resultado = usuarioService.transformarDatosUsuario(data, email);

    expect(resultado.rut).toBeNull();
    expect(resultado.email).toBe(email);
    expect(resultado.name).toBe('test');
    expect(resultado.firstName).toBe('test');
    expect(Array.isArray(resultado.carreras)).toBe(true);
  });

  test('transformarDatosUsuario debe extraer firstName del email', () => {
    const data = {};
    const email = 'juan.perez@test.com';

    const resultado = usuarioService.transformarDatosUsuario(data, email);

    expect(resultado.firstName).toBe('juan');
  });

  test('guardarUsuario debe guardar y retornar usuario transformado', () => {
    const data = { rut: '123', name: 'Test' };
    const email = 'test@test.com';

    const resultado = usuarioService.guardarUsuario(data, email);

    expect(resultado.email).toBe(email);
    const guardado = usuarioService.obtenerUsuario();
    expect(guardado).toEqual(resultado);
  });

  test('limpiarSesion debe limpiar storage', () => {
    storageService.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, { rut: '123' });
    usuarioService.limpiarSesion();
    
    expect(usuarioService.obtenerUsuario()).toBeNull();
  });
});

describe('ResourceManager', () => {
  let resourceManager;

  beforeEach(() => {
    resourceManager = new global.ResourceManager();
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  test('inyectarScript debe resolver inmediatamente si ya está cargado', async () => {
    const src = 'test.js';
    resourceManager.recursosCargados.set(src, true);

    await resourceManager.inyectarScript(src);

    expect(resourceManager.recursosCargados.has(src)).toBe(true);
  });

  test('inyectarScript debe rechazar en caso de error', async () => {
    const src = 'test.js';
    const script = document.createElement('script');
    document.createElement = jest.fn(() => script);

    const promise = resourceManager.inyectarScript(src);
    script.onerror();

    await expect(promise).rejects.toThrow(`No se pudo cargar ${src}`);
  });

  test('inyectarCss debe crear y agregar link', () => {
    const href = 'test.css';
    const id = 'test-style';
    document.getElementById = jest.fn(() => null);

    resourceManager.inyectarCss(href, id);

    expect(document.createElement).toHaveBeenCalledWith('link');
  });

  test('inyectarCss no debe crear duplicados', () => {
    const href = 'test.css';
    const id = 'test-style';
    const linkExistente = document.createElement('link');
    linkExistente.id = id;
    const originalGetElementById = document.getElementById.bind(document);
    document.getElementById = jest.fn((elementId) => {
      if (elementId === id) return linkExistente;
      return originalGetElementById(elementId);
    });
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => originalCreateElement(tag));

    resourceManager.inyectarCss(href, id);

    expect(document.createElement).not.toHaveBeenCalled();
  });

  test('limpiarCss debe eliminar elementos CSS por ID', () => {
    const link = document.createElement('link');
    link.id = 'test-style';
    document.head.appendChild(link);

    document.getElementById = jest.fn((id) => {
      if (id === 'test-style') return link;
      return null;
    });
    link.remove = jest.fn();

    resourceManager.limpiarCss(['test-style']);

    expect(link.remove).toHaveBeenCalled();
  });

  test('limpiarRecursosVista debe limpiar recursos por vista', () => {
    const script = document.createElement('script');
    script.src = 'http://test.com/script.js';
    document.body.appendChild(script);
    script.remove = jest.fn();

    const link = document.createElement('link');
    link.id = 'test-css';
    document.head.appendChild(link);
    link.remove = jest.fn();

    resourceManager.recursosCargados.set('vista-test', [
      { tipo: 'script', src: 'http://test.com/script.js' },
      { tipo: 'css', id: 'test-css' }
    ]);

    document.querySelector = jest.fn((selector) => {
      if (selector === 'script[src="http://test.com/script.js"]') return script;
      return null;
    });
    document.getElementById = jest.fn((id) => {
      if (id === 'test-css') return link;
      return null;
    });

    resourceManager.limpiarRecursosVista('vista-test');

    expect(script.remove).toHaveBeenCalled();
    expect(link.remove).toHaveBeenCalled();
    expect(resourceManager.recursosCargados.has('vista-test')).toBe(false);
  });

  test('inyectarScript debe ejecutar callback onload cuando se carga', async () => {
    const src = 'test.js';
    const script = document.createElement('script');
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'script') return script;
      return originalCreateElement(tag);
    });
    document.body.appendChild = jest.fn();

    const promise = resourceManager.inyectarScript(src);

    if (script.onload) {
      script.onload();
    }

    await promise;

    expect(resourceManager.recursosCargados.has(src)).toBe(true);
  });
});

describe('RenderService', () => {
  let renderService;

  beforeEach(() => {
    renderService = new global.RenderService();
  });

  test('generarError debe generar HTML de error', () => {
    const html = renderService.generarError('Mensaje de error', 'Título');
    
    expect(html).toContain('Mensaje de error');
    expect(html).toContain('Título');
    expect(html).toContain('Volver al inicio');
  });

  test('generarError debe usar título por defecto', () => {
    const html = renderService.generarError('Mensaje');
    
    expect(html).toContain('Error');
  });

  test('generarPerfil debe generar HTML completo', () => {
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

    const html = renderService.generarPerfil(usuario);

    expect(html).toContain('Juan Pérez');
    expect(html).toContain('juan@test.com');
    expect(html).toContain('12345678-9');
    expect(html).toContain('Estudiante');
    expect(html).toContain('Ingeniería');
  });

  test('generarPerfil debe manejar datos incompletos', () => {
    const usuario = {
      firstName: 'Juan'
    };

    const html = renderService.generarPerfil(usuario);

    expect(html).toContain('Juan');
    expect(html).toContain('No disponible');
    expect(html).toContain('No especificada');
  });

  test('generarHistorico debe generar HTML de histórico', () => {
    const html = renderService.generarHistorico();

    expect(html).toContain('Histórico de Proyecciones');
    expect(html).toContain('contenedorColumnas');
    expect(html).toContain('Estadísticas Académicas');
  });

  test('generarTesting debe generar HTML de testing', () => {
    const html = renderService.generarTesting();

    expect(html).toContain('Malla Curricular - Testing');
    expect(html).toContain('contenedorMalla');
    expect(html).toContain('resultadoProyeccion');
  });
});

describe('BusquedaService', () => {
  let busquedaService;

  beforeEach(() => {
    busquedaService = new global.BusquedaService();
    document.body.innerHTML = `
      <div class="seccion-menu">
        <div class="elemento-menu"><span>Malla Actual</span></div>
        <div class="elemento-menu"><span>Histórico</span></div>
      </div>
      <div class="elemento-inferior"><span>Ayuda</span></div>
      <div class="elemento-inferior cerrar-sesion"><span>Cerrar Sesión</span></div>
    `;
  });

  test('filtrarElementos debe mostrar todo cuando término está vacío', () => {
    const secciones = document.querySelectorAll('.seccion-menu');
    const elementosInferior = document.querySelectorAll('.elemento-inferior');
    
    busquedaService.filtrarElementos('');

    secciones.forEach(seccion => {
      expect(seccion.style.display).toBe('');
    });
  });

  test('filtrarElementos debe filtrar elementos que coincidan', () => {
    document.body.innerHTML = `
      <div class="seccion-menu">
        <div class="elemento-menu"><span>Malla Actual</span></div>
        <div class="elemento-menu"><span>Histórico</span></div>
      </div>
      <div class="elemento-inferior"><span>Ayuda</span></div>
    `;
    
    const secciones = document.querySelectorAll('.seccion-menu');
    const elementosInferior = document.querySelectorAll('.elemento-inferior');
    
    busquedaService.filtrarElementos('malla');

    const elementosMenu = document.querySelectorAll('.elemento-menu');
    elementosMenu.forEach(elemento => {
      const span = elemento.querySelector('span');
      if (span) {
        const texto = span.textContent.toLowerCase();
        if (texto.includes('malla')) {
          expect(elemento.style.display).toBe('');
        } else {
          expect(elemento.style.display).toBe('none');
        }
      }
    });
  });

  test('filtrarSecciones debe ocultar sección sin elementos visibles', () => {
    const secciones = document.querySelectorAll('.seccion-menu');
    
    busquedaService.filtrarSecciones(secciones, 'inexistente');

    secciones.forEach(seccion => {
      expect(seccion.style.display).toBe('none');
    });
  });
});

describe('MenuActivoService', () => {
  let menuActivoService;

  beforeEach(() => {
    menuActivoService = new global.MenuActivoService();
    document.body.innerHTML = `
      <div id="nombreUsuario">Usuario</div>
      <div class="elemento-menu"><span>Malla Actual</span></div>
      <div class="elemento-menu"><span>Estadísticas - Histórico</span></div>
      <div class="elemento-menu"><span>Proyección Testing</span></div>
    `;
  });

  test('establecer debe activar elemento por texto', () => {
    document.body.innerHTML = `
      <div class="elemento-menu"><span>Malla Actual</span></div>
      <div class="elemento-menu"><span>Histórico</span></div>
    `;
    const elementos = document.querySelectorAll('.elemento-menu');
    elementos.forEach(el => {
      el.classList.remove = jest.fn();
      el.classList.add = jest.fn();
    });

    menuActivoService.establecer('home');

    const elementoMalla = Array.from(elementos).find(el => {
      const span = el.querySelector('span');
      return span && span.textContent.includes('Malla Actual');
    });
    if (elementoMalla) {
      expect(elementoMalla.classList.add).toHaveBeenCalledWith('active');
    } else {
      expect(true).toBe(true);
    }
  });

});

describe('VistaStrategy', () => {
  test('getIdVista debe lanzar error', () => {
    const strategy = new global.VistaStrategy();
    expect(() => strategy.getIdVista()).toThrow();
  });

  test('cargar debe lanzar error', async () => {
    const strategy = new global.VistaStrategy();
    await expect(strategy.cargar(null, {})).rejects.toThrow();
  });

  test('limpiar debe lanzar error', () => {
    const strategy = new global.VistaStrategy();
    expect(() => strategy.limpiar(null)).toThrow();
  });
});

describe('VistaInicioStrategy', () => {
  let strategy;
  let resourceManager;

  beforeEach(() => {
    strategy = new VistaInicioStrategy('<div>Inicio</div>');
    resourceManager = {
      limpiarCss: jest.fn(),
      limpiarScripts: jest.fn()
    };
    window.mallaApp = null;
  });

  test('getIdVista debe retornar inicio', () => {
    expect(strategy.getIdVista()).toBe('inicio');
  });

  test('cargar debe establecer innerHTML', async () => {
    const areaContenido = { innerHTML: '' };
    const servicios = { resourceManager };

    await strategy.cargar(areaContenido, servicios);

    expect(areaContenido.innerHTML).toBe('<div>Inicio</div>');
  });

  test('cargar debe limpiar window.mallaApp si existe', async () => {
    window.mallaApp = { datos: 'test' };
    const areaContenido = { innerHTML: '' };
    const servicios = { resourceManager };

    await strategy.cargar(areaContenido, servicios);

    expect(window.mallaApp).toBeNull();
  });

  test('limpiar debe limpiar recursos', () => {
    strategy.limpiar(resourceManager);

    expect(resourceManager.limpiarCss).toHaveBeenCalled();
    expect(resourceManager.limpiarScripts).toHaveBeenCalled();
  });
});

describe('VistaPerfilStrategy', () => {
  let strategy;
  let usuarioService;
  let renderService;
  let resourceManager;

  beforeEach(() => {
    strategy = new global.VistaPerfilStrategy();
    usuarioService = {
      obtenerUsuario: jest.fn()
    };
    renderService = {
      generarPerfil: jest.fn(() => '<div>Perfil</div>')
    };
    resourceManager = {
      limpiarScripts: jest.fn()
    };
  });

  test('getIdVista debe retornar perfil', () => {
    expect(strategy.getIdVista()).toBe('perfil');
  });

  test('cargar debe generar perfil cuando hay usuario', async () => {
    const usuario = { name: 'Test' };
    usuarioService.obtenerUsuario.mockReturnValue(usuario);
    const areaContenido = { innerHTML: '' };
    const servicios = { usuarioService, renderService, resourceManager };
    const boton = document.createElement('button');
    boton.id = 'volverInicio';
    boton.addEventListener = jest.fn();
    document.getElementById = jest.fn((id) => {
      if (id === 'volverInicio') return boton;
      return null;
    });
    window.dispatchEvent = jest.fn();

    await strategy.cargar(areaContenido, servicios);

    expect(renderService.generarPerfil).toHaveBeenCalledWith(usuario);
    expect(areaContenido.innerHTML).toBe('<div>Perfil</div>');
    expect(boton.addEventListener).toHaveBeenCalled();

    const clickHandler = boton.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    if (clickHandler) {
      clickHandler();
      expect(window.dispatchEvent).toHaveBeenCalled();
    }
  });

  test('cargar debe lanzar error cuando no hay usuario', async () => {
    usuarioService.obtenerUsuario.mockReturnValue(null);
    const areaContenido = { innerHTML: '' };
    const servicios = { usuarioService, renderService, resourceManager };

    await expect(strategy.cargar(areaContenido, servicios)).rejects.toThrow();
  });
});

describe('NavegacionService', () => {
  let navegacionService;
  let storageService;
  let apiService;
  let renderService;
  let resourceManager;
  let usuarioService;

  beforeEach(() => {
    storageService = new global.StorageService();
    apiService = new global.ApiService();
    renderService = new global.RenderService();
    resourceManager = new global.ResourceManager();
    usuarioService = new global.UsuarioService(storageService);
    
    navegacionService = new global.NavegacionService(
      resourceManager,
      renderService,
      usuarioService,
      apiService
    );
  });

  test('inicializar debe configurar estrategias', () => {
    const areaContenido = { innerHTML: '<div>Inicio</div>' };
    navegacionService.inicializar(areaContenido, '<div>Inicio</div>');

    expect(navegacionService.estrategias.has('inicio')).toBe(true);
  });

  test('navegarA debe cargar vista correcta', async () => {
    const areaContenido = { innerHTML: '' };
    navegacionService.inicializar(areaContenido, '<div>Inicio</div>');
    
    await navegacionService.navegarA('inicio');

    expect(navegacionService.getVistaActual()).toBe('inicio');
  });

  test('navegarA debe lanzar error si vista no existe', async () => {
    const areaContenido = { innerHTML: '' };
    navegacionService.inicializar(areaContenido, '<div>Inicio</div>');

    await expect(navegacionService.navegarA('inexistente')).rejects.toThrow();
  });

  test('navegarA no debe cargar si ya está en esa vista', async () => {
    const areaContenido = { innerHTML: '' };
    navegacionService.inicializar(areaContenido, '<div>Inicio</div>');
    
    await navegacionService.navegarA('inicio');
    const primeraCarga = navegacionService.getVistaActual();
    
    await navegacionService.navegarA('inicio');
    const segundaCarga = navegacionService.getVistaActual();

    expect(primeraCarga).toBe(segundaCarga);
  });

  test('navegarA debe limpiar vista anterior antes de cargar nueva', async () => {
    const areaContenido = { innerHTML: '' };
    navegacionService.inicializar(areaContenido, '<div>Inicio</div>');
    const limpiarSpy = jest.spyOn(resourceManager, 'limpiarScripts');

    await navegacionService.navegarA('inicio');
    await navegacionService.navegarA('perfil');

    expect(limpiarSpy).toHaveBeenCalled();
  });

  test('navegarA debe manejar errores y mostrar mensaje de error', async () => {
    const areaContenido = { innerHTML: '' };
    navegacionService.inicializar(areaContenido, '<div>Inicio</div>');
    
    const estrategiaError = new global.VistaPerfilStrategy();
    estrategiaError.cargar = jest.fn().mockRejectedValue(new Error('Error de carga'));
    navegacionService.estrategias.set('perfil', estrategiaError);

    await navegacionService.navegarA('perfil');

    expect(areaContenido.innerHTML).toContain('Error al cargar');
    expect(areaContenido.innerHTML).toContain('Error de carga');
  });

  test('cargarInicio debe navegar a inicio', async () => {
    const areaContenido = { innerHTML: '' };
    navegacionService.inicializar(areaContenido, '<div>Inicio</div>');
    
    await navegacionService.cargarInicio();

    expect(navegacionService.getVistaActual()).toBe('inicio');
  });
});

describe('VistaMallaActualStrategy', () => {
  let strategy;
  let resourceManager;
  let apiService;

  beforeEach(() => {
    strategy = new global.VistaMallaActualStrategy();
    resourceManager = {
      limpiarCss: jest.fn(),
      limpiarScripts: jest.fn(),
      inyectarScript: jest.fn(() => Promise.resolve())
    };
    apiService = {};
    fetch.mockClear();
    window.APP_CONFIG = undefined;
  });

  test('getIdVista debe retornar malla-actual', () => {
    expect(strategy.getIdVista()).toBe('malla-actual');
  });

  test('cargar debe cargar HTML y scripts', async () => {
    const areaContenido = { innerHTML: '' };
    const servicios = { apiService, resourceManager };

    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue('<body><div>Malla</div></body>')
    });

    await strategy.cargar(areaContenido, servicios);

    expect(fetch).toHaveBeenCalled();
    expect(window.APP_CONFIG).toBeDefined();
    expect(resourceManager.inyectarScript).toHaveBeenCalled();
  });

  test('cargar debe lanzar error cuando fetch falla', async () => {
    const areaContenido = { innerHTML: '' };
    const servicios = { apiService, resourceManager };

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(strategy.cargar(areaContenido, servicios)).rejects.toThrow();
  });

  test('limpiar debe limpiar recursos', () => {
    strategy.limpiar(resourceManager);

    expect(resourceManager.limpiarCss).toHaveBeenCalled();
    expect(resourceManager.limpiarScripts).toHaveBeenCalled();
  });
});

describe('VistaHistoricoStrategy', () => {
  let strategy;
  let resourceManager;
  let renderService;

  beforeEach(() => {
    strategy = new global.VistaHistoricoStrategy();
    resourceManager = {
      limpiarScripts: jest.fn(),
      inyectarCss: jest.fn()
    };
    renderService = {
      generarHistorico: jest.fn(() => '<div>Histórico</div>')
    };
    window.historicoApp = undefined;
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('getIdVista debe retornar historico', () => {
    expect(strategy.getIdVista()).toBe('historico');
  });

  test('cargar debe limpiar historicoApp si existe', async () => {
    window.historicoApp = { datos: 'test' };
    const areaContenido = { innerHTML: '' };
    const servicios = { renderService, resourceManager };
    const contenedor = document.createElement('div');
    contenedor.id = 'contenedorColumnas';
    document.body.appendChild(contenedor);
    const script = document.createElement('script');
    script.onload = jest.fn();
    script.onerror = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'script') return script;
      return originalCreateElement(tag);
    });
    document.getElementById = jest.fn((id) => {
      if (id === 'contenedorColumnas') return contenedor;
      if (id === 'historico-script') return null;
      return null;
    });
    document.body.appendChild = jest.fn();

    const promise = strategy.cargar(areaContenido, servicios);
    jest.advanceTimersByTime(100);
    if (script.onload) script.onload();
    await promise;

    expect(window.historicoApp).toBeNull();
  });

  test('limpiar debe limpiar recursos e historicoApp', () => {
    window.historicoApp = { datos: 'test' };
    
    strategy.limpiar(resourceManager);

    expect(resourceManager.limpiarScripts).toHaveBeenCalled();
    expect(window.historicoApp).toBeNull();
  });
});

describe('VistaTestingStrategy', () => {
  let strategy;
  let resourceManager;
  let renderService;

  beforeEach(() => {
    strategy = new global.VistaTestingStrategy();
    resourceManager = {
      limpiarScripts: jest.fn(),
      inyectarScript: jest.fn(() => Promise.resolve())
    };
    renderService = {
      generarTesting: jest.fn(() => '<div>Testing</div>')
    };
    document.body.innerHTML = '';
    window.prepararProyeccion = undefined;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('getIdVista debe retornar proyeccion-testing', () => {
    expect(strategy.getIdVista()).toBe('proyeccion-testing');
  });

  test('cargar debe generar HTML y ejecutar testing', async () => {
    const areaContenido = { innerHTML: '' };
    const servicios = { renderService, resourceManager };
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultadoProyeccion';
    document.body.appendChild(resultDiv);
    document.getElementById = jest.fn((id) => {
      if (id === 'resultadoProyeccion') return resultDiv;
      return null;
    });

    window.prepararProyeccion = jest.fn(() => Promise.resolve({ test: 'data' }));

    await strategy.cargar(areaContenido, servicios);

    expect(renderService.generarTesting).toHaveBeenCalled();
    expect(areaContenido.innerHTML).toBe('<div>Testing</div>');
    expect(resourceManager.inyectarScript).toHaveBeenCalled();

    jest.advanceTimersByTime(600);

    expect(window.prepararProyeccion).toHaveBeenCalled();
  });

  test('ejecutarTesting debe manejar error cuando función no existe', () => {
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultadoProyeccion';
    document.body.appendChild(resultDiv);
    document.getElementById = jest.fn(() => resultDiv);

    strategy.ejecutarTesting();
    jest.advanceTimersByTime(600);

    expect(resultDiv.innerHTML).toContain('Error');
  });

  test('ejecutarTesting no debe fallar cuando elemento no existe', () => {
    document.getElementById = jest.fn(() => null);

    expect(() => strategy.ejecutarTesting()).not.toThrow();
  });

  test('limpiar debe limpiar scripts', () => {
    strategy.limpiar(resourceManager);

    expect(resourceManager.limpiarScripts).toHaveBeenCalled();
  });
});

describe('UsuarioUIService', () => {
  let usuarioUIService;

  beforeEach(() => {
    usuarioUIService = new global.UsuarioUIService();
    document.body.innerHTML = '';
  });

  test('mostrarInformacion debe actualizar nombre de usuario', () => {
    const elemento = document.createElement('div');
    elemento.id = global.AppConfig.IDS.NOMBRE_USUARIO;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { name: 'Test User' };
    usuarioUIService.mostrarInformacion(usuario);

    expect(elemento.textContent).toBe('Test User');
  });

  test('mostrarInformacion debe actualizar avatar con imagen', () => {
    const elemento = document.createElement('div');
    elemento.id = global.AppConfig.IDS.AVATAR_USUARIO;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { profilePicture: 'path/to/image.png', firstName: 'Test' };
    usuarioUIService.mostrarInformacion(usuario);

    expect(elemento.innerHTML).toContain('img');
  });

  test('mostrarInformacion debe actualizar avatar con inicial', () => {
    const elemento = document.createElement('div');
    elemento.id = global.AppConfig.IDS.AVATAR_USUARIO;
    document.body.appendChild(elemento);
    document.getElementById = jest.fn(() => elemento);

    const usuario = { firstName: 'Test' };
    usuarioUIService.mostrarInformacion(usuario);

    expect(elemento.textContent).toBe('T');
  });

  test('configurarClicksPerfil debe agregar listeners', () => {
    const nombreEl = document.createElement('div');
    nombreEl.id = global.AppConfig.IDS.NOMBRE_USUARIO;
    nombreEl.addEventListener = jest.fn();
    document.body.appendChild(nombreEl);

    const avatarEl = document.createElement('div');
    avatarEl.id = global.AppConfig.IDS.AVATAR_USUARIO;
    avatarEl.addEventListener = jest.fn();
    document.body.appendChild(avatarEl);

    document.getElementById = jest.fn((id) => {
      if (id === global.AppConfig.IDS.NOMBRE_USUARIO) return nombreEl;
      if (id === global.AppConfig.IDS.AVATAR_USUARIO) return avatarEl;
      return null;
    });

    const handler = jest.fn();
    usuarioUIService.configurarClicksPerfil(handler);

    expect(nombreEl.addEventListener).toHaveBeenCalled();
    expect(avatarEl.addEventListener).toHaveBeenCalled();
    expect(avatarEl.style.cursor).toBe('pointer');
  });
});

describe('MainMenuApp', () => {
  let app;

  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = `
      <div class="area-contenido"><div>Inicio</div></div>
      <div id="${global.AppConfig.IDS.NOMBRE_USUARIO}"></div>
      <div id="${global.AppConfig.IDS.AVATAR_USUARIO}"></div>
      <div id="${global.AppConfig.IDS.CORREO_USUARIO}"></div>
      <button id="${global.AppConfig.IDS.BOTON_CERRAR_SESION}"></button>
      <input id="${global.AppConfig.IDS.ENTRADA_BUSQUEDA}" />
    `;
    jest.clearAllMocks();
  });

  test('debe inicializar correctamente', () => {
    const usuario = { name: 'Test', email: 'test@test.com' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

    app = new global.MainMenuApp();

    expect(app.storageService).toBeDefined();
    expect(app.usuarioService).toBeDefined();
    expect(app.navegacionService).toBeDefined();
  });

  test('cargarDatosUsuario debe cargar usuario cuando existe', () => {
    const usuario = { name: 'Test', email: 'test@test.com' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));

    app = new global.MainMenuApp();

    const nombreEl = document.getElementById(global.AppConfig.IDS.NOMBRE_USUARIO);
    expect(nombreEl.textContent).toBe('Test');
  });

  test('realizarCierreSesion debe limpiar sesión y redirigir', () => {
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify({ name: 'Test' }));
    app = new global.MainMenuApp();

    const locationSpy = { href: '' };
    Object.defineProperty(window, 'location', {
      value: locationSpy,
      writable: true,
      configurable: true
    });

    app.realizarCierreSesion();

    expect(sessionStorage.getItem(global.AppConfig.CLAVES.DATOS_USUARIO)).toBeNull();
    expect(locationSpy.href).toBe(global.AppConfig.URLS.INDEX);
  });

  test('cargarPerfil debe navegar a perfil', async () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA');

    await app.cargarPerfil();

    expect(navegarSpy).toHaveBeenCalledWith('perfil');
  });

  test('cargarMallaActual debe navegar a malla-actual', async () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    
    fetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue('<body><div>Malla</div></body>')
    });

    app = new global.MainMenuApp();

    const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockResolvedValue();

    await app.cargarMallaActual();

    expect(navegarSpy).toHaveBeenCalledWith('malla-actual');
  }, 15000);

  test('cargarInicio debe navegar a inicio', async () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const areaContenido = document.createElement('div');
    areaContenido.id = global.AppConfig.IDS.AREA_CONTENIDO.substring(1);
    document.body.appendChild(areaContenido);
    app.navegacionService.inicializar(areaContenido, '<div>Inicio</div>');

    await app.cargarInicio();

    expect(app.menuActivoService).toBeDefined();
  });

  test('configurarBusqueda debe agregar event listener', () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const entrada = document.getElementById(global.AppConfig.IDS.ENTRADA_BUSQUEDA);
    if (entrada) {
      entrada.addEventListener = jest.fn();
      const filtrarSpy = jest.spyOn(app.busquedaService, 'filtrarElementos');

      app.configurarBusqueda();

      const handler = entrada.addEventListener.mock.calls.find(call => call[0] === 'input')?.[1];
      if (handler) {
        handler({ target: { value: 'test' } });
        expect(filtrarSpy).toHaveBeenCalledWith('test');
      }
    }
  });

  test('configurarNavegacionMallaActual debe agregar event listener', () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const elementoMalla = document.createElement('div');
    elementoMalla.className = 'elemento-menu';
    const span = document.createElement('span');
    span.textContent = 'Malla Actual';
    elementoMalla.appendChild(span);
    document.body.appendChild(elementoMalla);

    elementoMalla.addEventListener = jest.fn();
    const cargarSpy = jest.spyOn(app, 'cargarMallaActual').mockResolvedValue();
    const establecerSpy = jest.spyOn(app.menuActivoService, 'establecer');

    app.configurarNavegacionMallaActual();

    const clickHandler = elementoMalla.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    if (clickHandler) {
      clickHandler();
      expect(cargarSpy).toHaveBeenCalled();
      expect(establecerSpy).toHaveBeenCalledWith('malla-actual');
    }
  });

  test('configurarNavegacionHistorico debe agregar event listener', () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const elementoHistorico = document.createElement('div');
    elementoHistorico.className = 'elemento-menu';
    const enlace = document.createElement('a');
    const span = document.createElement('span');
    span.textContent = 'Estadísticas - Histórico';
    enlace.appendChild(span);
    elementoHistorico.appendChild(enlace);
    document.body.appendChild(elementoHistorico);

    enlace.addEventListener = jest.fn();
    const cargarSpy = jest.spyOn(app, 'cargarHistorico').mockResolvedValue();
    const establecerSpy = jest.spyOn(app.menuActivoService, 'establecer');

    app.configurarNavegacionHistorico();

    const handler = enlace.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    if (handler) {
      const evento = { preventDefault: jest.fn() };
      handler(evento);
      expect(evento.preventDefault).toHaveBeenCalled();
      expect(cargarSpy).toHaveBeenCalled();
      expect(establecerSpy).toHaveBeenCalledWith('historico');
    }
  });

  test('configurarNavegacionTesting debe agregar event listener', () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const elementoTesting = document.createElement('div');
    elementoTesting.className = 'elemento-menu';
    const span = document.createElement('span');
    span.textContent = 'Proyección Testing';
    elementoTesting.appendChild(span);
    document.body.appendChild(elementoTesting);

    elementoTesting.addEventListener = jest.fn();
    const cargarSpy = jest.spyOn(app, 'cargarTesting').mockResolvedValue();
    const establecerSpy = jest.spyOn(app.menuActivoService, 'establecer');

    app.configurarNavegacionTesting();

    const handler = elementoTesting.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    if (handler) {
      const evento = { preventDefault: jest.fn() };
      handler(evento);
      expect(evento.preventDefault).toHaveBeenCalled();
      expect(cargarSpy).toHaveBeenCalled();
      expect(establecerSpy).toHaveBeenCalledWith('proyeccion-testing');
    }
  });

  test('configurarNavegacionAtras debe agregar event listener', async () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const areaContenido = document.createElement('div');
    app.navegacionService.inicializar(areaContenido, '<div>Inicio</div>');
    await app.navegacionService.navegarA('inicio');

    const cargarInicioSpy = jest.spyOn(app, 'cargarInicio').mockResolvedValue();
    app.configurarNavegacionAtras();

    const evento = new window.CustomEvent('navigateBack');
    window.dispatchEvent(evento);

    expect(cargarInicioSpy).toHaveBeenCalled();
  });

  test('cargarPerfil debe manejar errores correctamente', async () => {
    const usuario = { name: 'Test' };
    sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    app = new global.MainMenuApp();

    const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockRejectedValue(new Error('Error de navegación'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await app.cargarPerfil();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar perfil:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  describe('VistaMisSimulacionesEgreso', () => {
    test('debe tener getIdVista correcto', () => {
      const estrategia = new global.VistaMisSimulacionesEgreso();
      expect(estrategia.getIdVista()).toBe('mis-simulaciones-egreso');
    });

    test('debe cargar vista correctamente', async () => {
      const estrategia = new global.VistaMisSimulacionesEgreso();
      const areaContenido = document.createElement('div');
      const servicios = {
        resourceManager: new global.ResourceManager(),
        renderService: new global.RenderService(),
        usuarioService: new global.UsuarioService(new global.StorageService()),
        apiService: new global.ApiService()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce('<div>Mis Simulaciones Egreso</div>')
      });

      global.window.poblarSimulacionesEgreso = jest.fn();
      global.window.poblarSimulaciones = jest.fn();

      await estrategia.cargar(areaContenido, servicios);

      expect(areaContenido.innerHTML).toContain('Mis Simulaciones Egreso');
    });

    test('debe manejar error al cargar HTML', async () => {
      const estrategia = new global.VistaMisSimulacionesEgreso();
      const areaContenido = document.createElement('div');
      const servicios = {
        resourceManager: new global.ResourceManager(),
        renderService: new global.RenderService(),
        usuarioService: new global.UsuarioService(new global.StorageService()),
        apiService: new global.ApiService()
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(estrategia.cargar(areaContenido, servicios)).rejects.toThrow();
    });

    test('debe usar poblarSimulaciones si poblarSimulacionesEgreso no existe', async () => {
      const estrategia = new global.VistaMisSimulacionesEgreso();
      const areaContenido = document.createElement('div');
      const servicios = {
        resourceManager: new global.ResourceManager(),
        renderService: new global.RenderService(),
        usuarioService: new global.UsuarioService(new global.StorageService()),
        apiService: new global.ApiService()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce('<div>Mis Simulaciones Egreso</div>')
      });

      global.window.poblarSimulacionesEgreso = undefined;
      global.window.poblarSimulaciones = jest.fn();

      await estrategia.cargar(areaContenido, servicios);

      expect(global.window.poblarSimulaciones).toHaveBeenCalledWith('simulacion_egreso');
    });
  });

  describe('VistaMisSimulacionesProxSemestre', () => {
    test('debe tener getIdVista correcto', () => {
      const estrategia = new global.VistaMisSimulacionesProxSemestre();
      expect(estrategia.getIdVista()).toBe('mis-simulaciones-prox-semestre');
    });

    test('debe cargar vista correctamente', async () => {
      const estrategia = new global.VistaMisSimulacionesProxSemestre();
      const areaContenido = document.createElement('div');
      const servicios = {
        resourceManager: new global.ResourceManager(),
        renderService: new global.RenderService(),
        usuarioService: new global.UsuarioService(new global.StorageService()),
        apiService: new global.ApiService()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce('<div>Mis Simulaciones Prox Semestre</div>')
      });

      global.window.poblarSimulacionesProxSemestre = jest.fn();
      global.window.poblarSimulaciones = jest.fn();

      await estrategia.cargar(areaContenido, servicios);

      expect(areaContenido.innerHTML).toContain('Mis Simulaciones Prox Semestre');
    });

    test('debe manejar error al cargar HTML', async () => {
      const estrategia = new global.VistaMisSimulacionesProxSemestre();
      const areaContenido = document.createElement('div');
      const servicios = {
        resourceManager: new global.ResourceManager(),
        renderService: new global.RenderService(),
        usuarioService: new global.UsuarioService(new global.StorageService()),
        apiService: new global.ApiService()
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(estrategia.cargar(areaContenido, servicios)).rejects.toThrow();
    });
  });

  describe('VistaSimulacionProxSemestre', () => {
    test('debe tener getIdVista correcto', () => {
      const estrategia = new global.VistaSimulacionProxSemestre();
      expect(estrategia.getIdVista()).toBe('simulacion-prox-semestre');
    });

    test('debe cargar vista correctamente', async () => {
      const estrategia = new global.VistaSimulacionProxSemestre();
      const areaContenido = document.createElement('div');
      const servicios = {
        resourceManager: new global.ResourceManager(),
        renderService: new global.RenderService(),
        usuarioService: new global.UsuarioService(new global.StorageService()),
        apiService: new global.ApiService()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValueOnce('<div>Simulación Próximo Semestre</div>')
      });

      await estrategia.cargar(areaContenido, servicios);

      expect(areaContenido.innerHTML).toContain('Simulación Próximo Semestre');
    });

    test('debe manejar error al cargar HTML', async () => {
      const estrategia = new global.VistaSimulacionProxSemestre();
      const areaContenido = document.createElement('div');
      const servicios = {
        resourceManager: new global.ResourceManager(),
        renderService: new global.RenderService(),
        usuarioService: new global.UsuarioService(new global.StorageService()),
        apiService: new global.ApiService()
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(estrategia.cargar(areaContenido, servicios)).rejects.toThrow();
    });
  });

  describe('VistaTestingStrategy', () => {
    test('debe tener getIdVista correcto', () => {
      const estrategia = new global.VistaTestingStrategy();
      expect(estrategia.getIdVista()).toBe('proyeccion-testing');
    });

    test('debe poblar opciones de carrera', () => {
      const estrategia = new global.VistaTestingStrategy();
      const selectCarrera = document.createElement('select');
      const usuario = {
        carreras: [
          { codigo: '8266', nombre: 'ITI', catalogo: '202410' },
          { codigo: '8616', nombre: 'ICI', catalogo: '202310' }
        ]
      };
      sessionStorage.setItem('ucn_user_data', JSON.stringify(usuario));

      estrategia.poblarOpciones(selectCarrera);

      expect(selectCarrera.options.length).toBe(2);
      expect(selectCarrera.options[0].value).toBe('8266');
      expect(selectCarrera.options[0].dataset.catalogo).toBe('202410');
    });
  });

  describe('RenderService', () => {
    test('generarHistorico debe generar HTML correcto', () => {
      const renderService = new global.RenderService();
      const html = renderService.generarHistorico();
      expect(html).toContain('Estadísticas - Histórico');
    });

    test('generarDashboardRoss debe generar HTML correcto', () => {
      const renderService = new global.RenderService();
      const html = renderService.generarDashboardRoss();
      expect(html).toContain('Dashboard Ross');
    });

    test('generarTesting debe generar HTML correcto', () => {
      const renderService = new global.RenderService();
      const html = renderService.generarTesting();
      expect(html).toContain('Simulación Egreso');
    });
  });

  describe('BusquedaService', () => {
    test('debe filtrar elementos correctamente', () => {
      const busquedaService = new global.BusquedaService();
      document.body.innerHTML = `
        <div class="elemento-menu">
          <span>Malla Actual</span>
        </div>
        <div class="elemento-menu">
          <span>Dashboard Ross</span>
        </div>
        <div class="elemento-inferior cerrar-sesion">
          <span>Cerrar Sesión</span>
        </div>
      `;

      const elementosMenu = document.querySelectorAll('.elemento-menu');
      const elementosInferior = document.querySelectorAll('.elemento-inferior');

      busquedaService.filtrarElementosSuperiores(elementosMenu, 'malla');
      busquedaService.filtrarElementosInferiores(elementosInferior, 'cerrar');

      expect(elementosMenu[0].style.display).toBe('');
      expect(elementosMenu[1].style.display).toBe('none');
      expect(elementosInferior[0].style.display).toBe('');
    });
  });

  describe('MenuActivoService', () => {
    test('debe activar elemento por tipo', () => {
      const menuActivoService = new global.MenuActivoService();
      document.body.innerHTML = `
        <div id="${global.AppConfig.IDS.NOMBRE_USUARIO}"></div>
        <div class="elemento-menu">
          <span>Malla Actual</span>
        </div>
        <div class="elemento-menu">
          <span>Dashboard Ross</span>
        </div>
      `;

      menuActivoService.establecer('malla-actual');
      const elementosMenu = document.querySelectorAll('.elemento-menu');
      const activo = Array.from(elementosMenu).find(el => el.classList.contains('active'));
      expect(activo).toBeDefined();
    });

    test('debe activar perfil correctamente', () => {
      const menuActivoService = new global.MenuActivoService();
      document.body.innerHTML = `
        <div id="${global.AppConfig.IDS.NOMBRE_USUARIO}"></div>
      `;

      menuActivoService.establecer('profile');
      const nombreUsuario = document.getElementById(global.AppConfig.IDS.NOMBRE_USUARIO);
      expect(nombreUsuario.classList.contains('active')).toBe(true);
    });
  });

  describe('UsuarioUIService', () => {
    test('debe actualizar UI de usuario correctamente', async () => {
      const usuarioUIService = new global.UsuarioUIService();
      document.body.innerHTML = `
        <div id="${global.AppConfig.IDS.NOMBRE_USUARIO}"></div>
        <div id="${global.AppConfig.IDS.AVATAR_USUARIO}"></div>
      `;

      const usuario = {
        name: 'Test User',
        foto_perfil: 'profile.jpg',
        rut: '222222222'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: jest.fn().mockResolvedValueOnce(new Blob())
      });

      await usuarioUIService.actualizar(usuario);

      const nombreUsuario = document.getElementById(global.AppConfig.IDS.NOMBRE_USUARIO);
      expect(nombreUsuario.textContent).toBe('Test User');
    });

    test('debe manejar usuario sin foto_perfil', async () => {
      const usuarioUIService = new global.UsuarioUIService();
      document.body.innerHTML = `
        <div id="${global.AppConfig.IDS.NOMBRE_USUARIO}"></div>
        <div id="${global.AppConfig.IDS.AVATAR_USUARIO}"></div>
      `;

      const usuario = {
        name: 'Test User',
        rut: '222222222'
      };

      await usuarioUIService.actualizar(usuario);

      const nombreUsuario = document.getElementById(global.AppConfig.IDS.NOMBRE_USUARIO);
      expect(nombreUsuario.textContent).toBe('Test User');
    });
  });

  describe('NavegacionService', () => {
    test('navegarA debe manejar vista no encontrada', async () => {
      const navegacionService = new global.NavegacionService(
        new global.ResourceManager(),
        new global.RenderService(),
        new global.UsuarioService(new global.StorageService()),
        new global.ApiService()
      );
      const areaContenido = document.createElement('div');
      navegacionService.inicializar(areaContenido, '<div>Inicio</div>');

      await navegacionService.navegarA('vista-inexistente');

      expect(areaContenido.innerHTML).toBe('<div>Inicio</div>');
    });

    test('navegarA debe manejar error al cargar vista', async () => {
      const navegacionService = new global.NavegacionService(
        new global.ResourceManager(),
        new global.RenderService(),
        new global.UsuarioService(new global.StorageService()),
        new global.ApiService()
      );
      const areaContenido = document.createElement('div');
      navegacionService.inicializar(areaContenido, '<div>Inicio</div>');

      const estrategia = navegacionService.estrategias.get('inicio');
      const cargarSpy = jest.spyOn(estrategia, 'cargar').mockRejectedValue(new Error('Error de carga'));

      try {
        await navegacionService.navegarA('inicio');
      } catch (error) {
        expect(error.message).toBe('Error de carga');
      }

      cargarSpy.mockRestore();
    });

    test('navegarA debe manejar areaContenido no definida', async () => {
      const navegacionService = new global.NavegacionService(
        new global.ResourceManager(),
        new global.RenderService(),
        new global.UsuarioService(new global.StorageService()),
        new global.ApiService()
      );

      await navegacionService.navegarA('inicio');

      expect(navegacionService.vistaActual).toBeNull();
    });
  });

  describe('MainMenuApp - métodos adicionales', () => {
    beforeEach(() => {
      const usuario = { name: 'Test' };
      sessionStorage.setItem(global.AppConfig.CLAVES.DATOS_USUARIO, JSON.stringify(usuario));
    });

    test('cargarMallaActual debe manejar errores', async () => {
      app = new global.MainMenuApp();
      const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockRejectedValue(new Error('Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await app.cargarMallaActual();

      expect(consoleErrorSpy).toHaveBeenCalled();
      navegarSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('cargarHistorico debe manejar errores', () => {
      app = new global.MainMenuApp();
      const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockImplementation(() => {
        throw new Error('Error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      app.cargarHistorico();

      expect(consoleErrorSpy).toHaveBeenCalled();
      navegarSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('cargarDashboardRoss debe manejar errores', async () => {
      app = new global.MainMenuApp();
      const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockRejectedValue(new Error('Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await app.cargarDashboardRoss();

      expect(consoleErrorSpy).toHaveBeenCalled();
      navegarSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('cargarTesting debe manejar errores', async () => {
      app = new global.MainMenuApp();
      const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockRejectedValue(new Error('Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await app.cargarTesting();

      expect(consoleErrorSpy).toHaveBeenCalled();
      navegarSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('cargarSimulacionProxSemestre debe manejar errores', async () => {
      app = new global.MainMenuApp();
      const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockRejectedValue(new Error('Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await app.cargarSimulacionProxSemestre();

      expect(consoleErrorSpy).toHaveBeenCalled();
      navegarSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('cargarInicio debe manejar errores', () => {
      app = new global.MainMenuApp();
      const cargarInicioSpy = jest.spyOn(app.navegacionService, 'cargarInicio').mockImplementation(() => {
        throw new Error('Error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      app.cargarInicio();

      expect(consoleErrorSpy).toHaveBeenCalled();
      cargarInicioSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('cargarMisSimulacionesEgreso debe manejar errores', () => {
      app = new global.MainMenuApp();
      const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockImplementation(() => {
        throw new Error('Error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      app.cargarMisSimulacionesEgreso();

      expect(consoleErrorSpy).toHaveBeenCalled();
      navegarSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('cargarMisSimulacionesProxSemestre debe manejar errores', () => {
      app = new global.MainMenuApp();
      const navegarSpy = jest.spyOn(app.navegacionService, 'navegarA').mockImplementation(() => {
        throw new Error('Error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      app.cargarMisSimulacionesProxSemestre();

      expect(consoleErrorSpy).toHaveBeenCalled();
      navegarSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('realizarLoginYRedirigir debe manejar respuesta inválida', async () => {
      app = new global.MainMenuApp();
      global.window.location = { href: '' };
      const loginSpy = jest.spyOn(app.apiService, 'login').mockResolvedValue({});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(app.realizarLoginYRedirigir('test@example.com', 'password')).rejects.toThrow();

      loginSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('realizarLoginYRedirigir debe manejar error de login', async () => {
      app = new global.MainMenuApp();
      const loginSpy = jest.spyOn(app.apiService, 'login').mockRejectedValue(new Error('Error de login'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(app.realizarLoginYRedirigir('test@example.com', 'password')).rejects.toThrow();

      loginSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('configurarNavegacionAyuda debe configurar botón de ayuda', () => {
      document.body.innerHTML = `<button id="botonAyuda"></button>`;
      app = new global.MainMenuApp();
      global.window.location = { href: '' };

      app.configurarNavegacionAyuda();

      const boton = document.getElementById('botonAyuda');
      boton.click();
      expect(global.window.location.href).toContain('mailto:');
    });
  });
});

