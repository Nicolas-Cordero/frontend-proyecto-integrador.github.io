class AppConfig {
  static CLAVES = {
    DATOS_USUARIO: 'ucn_user_data'
  };

  static URLS = {
    LOGIN_API: 'https://puclaro.ucn.cl/eross/avance/login.php',
    INDEX: 'index.html',
    MAIN_MENU: 'html/main-menu.html'
  };

  static RUTAS = {
    HTML: '../html/',
    JS: '../js/',
    CSS: '../css/'
  };

  static IDS = {
    AREA_CONTENIDO: '.area-contenido',
    NOMBRE_USUARIO: 'nombreUsuario',
    AVATAR_USUARIO: 'avatarUsuario',
    CORREO_USUARIO: 'correoUsuario',
    BOTON_CERRAR_SESION: 'botonCerrarSesion',
    ENTRADA_BUSQUEDA: 'entradaBusqueda',
    BOTON_TEMA: 'botonTema',
    BOTON_TOGGLE_BARRA: 'toggleBarra',
    BARRA_LATERAL: 'barraLateral'
  };

  static SCRIPTS_MALLA = ['mallas-api.js', 'mallas-ui.js', 'mallas.js', 'malla-actual.js'];
  static SCRIPTS_PROYECCION = ['proyeccion-trigger.js','limpiar-malla.js', 'proyeccion-ui.js', 'proyeccion-validador.js', 'proyeccion-procesador.js', 'proyeccion-constructor.js', 'proyeccion-app.js','proyeccion-app.js','mallas-api.js','historico-avance-api.js'];

  static APP_CONFIG_MALLA = {
    API_URL: 'http://localhost:3000/api/mallas',
    TIMEOUT_MS: 10000,
    CONTAINER_ID: 'contenedorMalla'
  };
}

class StorageService {
  getItem(key) {
    try {
      const valor = sessionStorage.getItem(key);
      return valor ? JSON.parse(valor) : null;
    } catch (error) {
      console.error(`Error al leer ${key}:`, error);
      return null;
    }
  }

  setItem(key, valor) {
    try {
      sessionStorage.setItem(key, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
      return false;
    }
  }

  removeItem(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
      return false;
    }
  }

  clear() {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar almacenamiento:', error);
      return false;
    }
  }
}

class ApiService {
  async fetchJson(url, options = {}) {
    try {
      const respuesta = await fetch(url, options);
      const texto = await respuesta.text();
      
      try {
        return JSON.parse(texto);
      } catch (error) {
        throw new Error(`Respuesta inválida JSON desde ${url}: ${texto}`);
      }
    } catch (error) {
      console.error(`Error en fetchJson ${url}:`, error);
      throw error;
    }
  }

  async login(email, password) {
    const url = `${AppConfig.URLS.LOGIN_API}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const datos = await this.fetchJson(url);
    
    if (datos && datos.error) {
      throw new Error(datos.error);
    }
    
    return datos;
  }
}

class ResourceManager {
  constructor() {
    this.recursosCargados = new Map();
  }

  inyectarScript(src) {
    return new Promise((resolve, reject) => {
      if (this.recursosCargados.has(src)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      
      script.onload = () => {
        this.recursosCargados.set(src, true);
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error(`No se pudo cargar ${src}`));
      };
      
      document.body.appendChild(script);
    });
  }

  inyectarCss(href, id) {
    if (document.getElementById(id)) {
      return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    this.recursosCargados.set(id, true);
  }

  limpiarScripts(patrones) {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      for (const patron of patrones) {
        if (script.src.includes(patron)) {
          this.recursosCargados.delete(script.src);
          script.remove();
        }
      }
    });
  }

  limpiarCss(ids) {
    ids.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.remove();
        this.recursosCargados.delete(id);
      }
    });
  }

  limpiarRecursosVista(vistaId) {
    const recursos = this.recursosCargados.get(vistaId) || [];
    recursos.forEach(recurso => {
      if (recurso.tipo === 'script') {
        const elemento = document.querySelector(`script[src="${recurso.src}"]`);
        if (elemento) elemento.remove();
      } else if (recurso.tipo === 'css') {
        const elemento = document.getElementById(recurso.id);
        if (elemento) elemento.remove();
      }
    });
    this.recursosCargados.delete(vistaId);
  }
}

class RenderService {
  generarError(mensaje, titulo = 'Error') {
    return `
      <div style="padding: 2rem; text-align: center;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
        <h2 style="color: #1e293b; margin-bottom: 1rem;">${titulo}</h2>
        <p style="color: #64748b; margin-bottom: 2rem;">${mensaje}</p>
        <button onclick="window.mainMenuApp.cargarInicio()" style="padding: 0.75rem 2rem; background: #667eea; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          Volver al inicio
        </button>
      </div>
    `;
  }

  generarPerfil(usuario) {
    const nombreCompleto = usuario.name || `${usuario.firstName || ''} ${usuario.lastName || ''}`.trim();
    const nombre = usuario.firstName || 'Usuario';
    const avatar = nombre.charAt(0).toUpperCase();
    const rol = usuario.role === 'student' ? 'Estudiante' : usuario.role === 'admin' ? 'Administrador' : 'Usuario';
    const correo = usuario.email || 'No disponible';
    const nombreUsuario = usuario.username || 'No disponible';
    const rut = usuario.rut || 'No disponible';
    
    const fotoPerfil = usuario.profilePicture;
    const rutaImagen = fotoPerfil ? `../${fotoPerfil}` : null;
    const contenidoAvatar = rutaImagen 
      ? `<img src="${rutaImagen}" alt="${nombre}">` 
      : avatar;
    
    const informacionAcademica = usuario.academicInfo || {};
    const carrera = informacionAcademica.career || 'No especificada';
    const generacion = informacionAcademica.generation || 'No especificada';
    const semestreActual = informacionAcademica.currentSemester || 0;
    const promedio = informacionAcademica.gpa || 0;

    return `
      <div class="contenedor-perfil">
        <div class="cabecera-perfil">
          <button class="boton-volver" id="volverInicio">
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </button>
          <h1>Perfil de Usuario</h1>
        </div>

        <div class="perfil-principal">
          <div class="tarjeta-perfil">
            <div class="seccion-avatar-perfil">
              <div class="avatar-perfil-grande">${contenidoAvatar}</div>
              <button class="boton-cambiar-avatar">
                <i class="fas fa-camera"></i>
              </button>
            </div>
            
            <div class="seccion-informacion-perfil">
              <h2>${nombreCompleto}</h2>
              <p class="rol-perfil">${rol}</p>
              <p class="correo-perfil">${correo}</p>
            </div>
          </div>
        </div>

        <div class="detalles-perfil">
          <div class="tarjeta-detalle">
            <div class="cabecera-tarjeta-detalle">
              <i class="fas fa-user"></i>
              <h3>Información Personal</h3>
            </div>
            <div class="cuerpo-tarjeta-detalle">
              <div class="fila-detalle">
                <span class="etiqueta-detalle">Nombre completo:</span>
                <span class="valor-detalle">${nombreCompleto}</span>
              </div>
              <div class="fila-detalle">
                <span class="etiqueta-detalle">RUT:</span>
                <span class="valor-detalle">${rut}</span>
              </div>
              <div class="fila-detalle">
                <span class="etiqueta-detalle">Nombre de usuario:</span>
                <span class="valor-detalle">${nombreUsuario}</span>
              </div>
              <div class="fila-detalle">
                <span class="etiqueta-detalle">Correo electrónico:</span>
                <span class="valor-detalle">${correo}</span>
              </div>
            </div>
          </div>

          <div class="tarjeta-detalle">
            <div class="cabecera-tarjeta-detalle">
              <i class="fas fa-graduation-cap"></i>
              <h3>Información Académica</h3>
            </div>
            <div class="cuerpo-tarjeta-detalle">
              <div class="fila-detalle">
                <span class="etiqueta-detalle">Carrera:</span>
                <span class="valor-detalle">${carrera}</span>
              </div>
              <div class="fila-detalle">
                <span class="etiqueta-detalle">Generación:</span>
                <span class="valor-detalle">${generacion}</span>
              </div>
              <div class="fila-detalle">
                <span class="etiqueta-detalle">Nivel actual:</span>
                <span class="valor-detalle">${semestreActual}° Semestre</span>
              </div>
              <div class="fila-detalle">
                <span class="etiqueta-detalle">Promedio:</span>
                <span class="valor-detalle">${promedio.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div id="estadisticasContainer"></div>
      </div>
    `;
  }

  generarHistorico() {
    return `
      <div>
        <header>
          <h1 class="page-title">Histórico de Proyecciones</h1>
          <p class="subtitle">Aquí se despliega todo el avance académico que llevas en la carrera</p>
        </header>

        <div id="carreraSelectorContainer"></div>

        <section class="card" aria-labelledby="cardTitle">
          <div class="card-header">
            <div id="cardTitle"><strong>Proyecciones por Periodo</strong></div>
          </div>

          <div class="hscroll-wrap" aria-live="polite">
            <div class="columnas" id="contenedorColumnas"></div>
          </div>
        </section>
      </div>
    `;
  }

  generarTesting() {
    return `
      <div style="padding: 2rem;">
        <header style="margin-bottom: 2rem;">
          <h1 style="margin: 0 0 0.5rem 0; font-size: 2rem; color: var(--text-primary, #000);">Malla Curricular - Testing</h1>
          <p style="margin: 0; color: var(--text-secondary, #666);">Página de prueba para los módulos de proyección</p>
        </header>

        <section class="card" aria-labelledby="cardTitle">
          <div class="card-header">
            <div id="cardTitle"><strong>Proyección - Resultado</strong></div>
          </div>

          <div style="margin: 1rem 0; display: flex; gap: .5rem; align-items: center;">
            <label for="selectCarrera" style="font-weight:600;">Carrera:</label>
            <select id="selectCarrera" style="padding: .4rem; min-width: 220px;">
              <option value="">-- Seleccionar carrera --</option>
            </select>
            <label for="cantCreditos" style="font-weight:600;">Cantidad de créditos máxima:</label>
            <input style="padding: .4rem; min-width: 220px; type="number" id="cantCreditos" name="Cantidad de créditos máxima" min="6" step="1" max="32" placeholder="Ingresa la cantidad máxima de créditos por semestre"/>
            <button id="botonEjecutarProyeccion" style="padding: .5rem 1rem; background: #22c55e; color: white; border: none; border-radius: .25rem; cursor: pointer; font-weight:600;">Ejecutar proyección</button>
          </div>

          <div class="hscroll-wrap" aria-live="polite">
            <div class="columnas" id="resultadoProyeccion"></div>
          </div>
        </section>
      </div>
    `;
  }
}

class UsuarioService {
  constructor(storageService) {
    this.storageService = storageService;
  }

  obtenerUsuario() {
    return this.storageService.getItem(AppConfig.CLAVES.DATOS_USUARIO);
  }

  validarSesion() {
    const usuario = this.obtenerUsuario();
    return usuario !== null;
  }

  transformarDatosUsuario(data, email) {
    return {
      rut: data.rut || null,
      email: email || null,
      name: data.name || (email ? email.split('@')[0] : null),
      firstName: (email ? (email.split('@')[0].split('.')[0] || email) : null),
      carreras: Array.isArray(data.carreras) ? data.carreras : [],
      academicInfo: {
        career: data.carreras && data.carreras[0] ? data.carreras[0].nombre : undefined,
        catalog: data.carreras && data.carreras[0] ? data.carreras[0].catalogo : undefined
      }
    };
  }

  guardarUsuario(data, email) {
    const usuario = this.transformarDatosUsuario(data, email);
    this.storageService.setItem(AppConfig.CLAVES.DATOS_USUARIO, usuario);
    return usuario;
  }

  limpiarSesion() {
    this.storageService.clear();
  }
}

class VistaStrategy {
  getIdVista() {
    throw new Error('getIdVista debe ser implementado');
  }

  async cargar(areaContenido, servicios) {
    throw new Error('cargar debe ser implementado');
  }

  limpiar(resourceManager) {
    throw new Error('limpiar debe ser implementado');
  }
}

class VistaInicioStrategy extends VistaStrategy {
  constructor(contenidoInicio) {
    super();
    this.contenidoInicio = contenidoInicio;
  }

  getIdVista() {
    return 'inicio';
  }

  async cargar(areaContenido, servicios) {
    const { resourceManager } = servicios;
    resourceManager.limpiarCss(['historico-scoped-style']);
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);
    
    if (window.mallaApp) {
      window.mallaApp = null;
    }

    areaContenido.innerHTML = this.contenidoInicio;
  }

  limpiar(resourceManager) {
    resourceManager.limpiarCss(['historico-scoped-style']);
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);
  }
}

class VistaPerfilStrategy extends VistaStrategy {
  getIdVista() {
    return 'perfil';
  }

  async cargar(areaContenido, servicios) {
    const { usuarioService, renderService, resourceManager } = servicios;
    
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);

    // Limpiar widget anterior si existe
    if (window.historicoEstadisticas) {
      window.historicoEstadisticas = null;
    }

    const usuario = usuarioService.obtenerUsuario();
    if (!usuario) {
      throw new Error('No hay datos de usuario disponibles');
    }

    const html = renderService.generarPerfil(usuario);
    areaContenido.innerHTML = html;

    resourceManager.inyectarCss(
      `${AppConfig.RUTAS.CSS}historico-estadisticas.css?v=2025121201`,
      'historico-estadisticas-style'
    );

    await resourceManager.inyectarScript(`${AppConfig.RUTAS.JS}carrera-selector.js?v=2025121201`);
    await resourceManager.inyectarScript(`${AppConfig.RUTAS.JS}historico-estadisticas.js?v=2025121201`);

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const widget = this.obtenerWidgetEstadisticas();
          if (widget && typeof widget.cargarDesdeUsuario === 'function') {
            const carreras = usuario.carreras || [];
            const primeraCarrera = carreras.length > 0 ? carreras[0] : null;
            
            if (primeraCarrera) {
              widget.cargarDesdeUsuario(usuario, primeraCarrera).catch(err => 
                console.warn('[VistaPerfil] Error al cargar estadísticas:', err)
              );
            }
          }
          resolve();
        }, 50);
      });
    });

    const botonVolver = document.getElementById('volverInicio');
    if (botonVolver) {
      botonVolver.addEventListener('click', () => {
        const evento = new CustomEvent('navigateBack');
        window.dispatchEvent(evento);
      });
    }
  }

  limpiar(resourceManager) {
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);
  }

  obtenerWidgetEstadisticas() {
    if (window.historicoEstadisticas) return window.historicoEstadisticas;
    if (window.HistoricoEstadisticas) {
      const widget = new window.HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
      window.historicoEstadisticas = widget;
      return widget;
    }
    return null;
  }

  async cargarEstadisticasAcademicas(usuario) {
    const widget = this.obtenerWidgetEstadisticas();
    if (widget && typeof widget.cargarDesdeUsuario === 'function') {
      await widget.cargarDesdeUsuario(usuario);
    }
  }
}

class VistaMallaActualStrategy extends VistaStrategy {
  getIdVista() {
    return 'malla-actual';
  }

  async cargar(areaContenido, servicios) {
    const { apiService, resourceManager } = servicios;
    
    resourceManager.limpiarCss(['historico-scoped-style']);

    const respuesta = await fetch(`${AppConfig.RUTAS.HTML}mallas (urr).html`);
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const htmlCompleto = await respuesta.text();
    const parserDOM = new DOMParser();
    const docParsed = parserDOM.parseFromString(htmlCompleto, 'text/html');
    const bodyContent = docParsed.body.innerHTML;
    
    areaContenido.innerHTML = bodyContent;

    window.APP_CONFIG = AppConfig.APP_CONFIG_MALLA;

    const scripts = AppConfig.SCRIPTS_MALLA;
    for (const scriptName of scripts) {
      const ruta = `${AppConfig.RUTAS.JS}${scriptName}?v=${Date.now()}`;
      await resourceManager.inyectarScript(ruta);
    }
  }

  limpiar(resourceManager) {
    resourceManager.limpiarCss(['historico-scoped-style']);
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);
  }
}

class VistaHistoricoStrategy extends VistaStrategy {
  getIdVista() {
    return 'historico';
  }

  async cargar(areaContenido, servicios) {
    const { renderService, resourceManager } = servicios;
    
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);
    
    if (window.historicoApp) {
      window.historicoApp = null;
    }

    resourceManager.inyectarCss(
      `${AppConfig.RUTAS.CSS}historico-scoped.css?v=${Date.now()}`,
      'historico-scoped-style'
    );

    const html = renderService.generarHistorico();
    areaContenido.innerHTML = html;

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(async () => {
          const contenedor = document.getElementById('contenedorColumnas');
          if (!contenedor) {
            console.error('El contenedor no existe después de renderizar');
            resolve();
            return;
          }

          // Inyectar script del selector de carrera
          await resourceManager.inyectarScript(`${AppConfig.RUTAS.JS}carrera-selector.js?v=${Date.now()}`);

          const scriptId = 'historico-script';
          const existente = document.getElementById(scriptId);
          if (existente) {
            existente.remove();
          }

          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `${AppConfig.RUTAS.JS}historico-script.js?v=${Date.now()}`;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          document.body.appendChild(script);
        }, 50);
      });
    });
  }

  limpiar(resourceManager) {
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);
    resourceManager.limpiarScripts(['carrera-selector.js', 'mis-simulaciones.js', 'proyeccion-ui.js']);
    if (window.historicoApp) {
      window.historicoApp = null;
    }
  }
}

class VistaTestingStrategy extends VistaStrategy {
  getIdVista() {
    return 'proyeccion-testing';
  }

  async cargar(areaContenido, servicios) {
    const { renderService, resourceManager } = servicios;
    
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);

    const html = renderService.generarTesting();
    areaContenido.innerHTML = html;

    const scripts = [
      'mallas-api.js',
      'proyeccion-validador.js',
      'proyeccion-procesador.js',
      'proyeccion-constructor.js',
      'proyeccion-app.js',
      'historico-avance-api.js',
      'proyeccion-ui.js',
      'proyeccion-trigger.js',
      'limpiar-malla.js'
    ];

    for (const scriptName of scripts) {
      const ruta = `${AppConfig.RUTAS.JS}${scriptName}?v=${Date.now()}`;
      await resourceManager.inyectarScript(ruta);
    }
    const selectCarrera = document.getElementById('selectCarrera');
    this.poblarOpciones(selectCarrera);
    const cantCreditos = document.getElementById('cantCreditos');
    const boton = document.getElementById('botonEjecutarProyeccion');

    boton.addEventListener('click', () => {window.ejecutarTesting(selectCarrera.value, selectCarrera.dataset.catalogo, Number(cantCreditos.value));});
    
  }

  poblarOpciones(selectCarrera){
    const carreras = JSON.parse(sessionStorage.getItem('ucn_user_data')).carreras;

    carreras.forEach(carrera => {
      const optionElement = document.createElement('option');
      optionElement.value = carrera.codigo;
      optionElement.textContent = carrera.nombre;
      optionElement.dataset.catalogo = carrera.catalogo;

      selectCarrera.appendChild(optionElement);
    });
  }
  
  limpiar(resourceManager) {
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_PROYECCION);
  }
}

class VistaMisSimulacionesEgreso extends VistaStrategy {
  getIdVista() {
    return 'mis-simulaciones';
  }

  async cargar(areaContenido, servicios) { 
    const {resourceManager} = servicios;
    
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);

    const respuesta = await fetch(`${AppConfig.RUTAS.HTML}mis-simulaciones-egreso.html`);
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    
    const htmlCompleto = await respuesta.text();
    const parserDOM = new DOMParser();
    const docParsed = parserDOM.parseFromString(htmlCompleto, 'text/html');
    const bodyContent = docParsed.body.innerHTML;
    
    areaContenido.innerHTML = bodyContent;

    window.APP_CONFIG = AppConfig.APP_CONFIG_MALLA;

    const scripts = [
      'poblar-simulaciones.js',
      'mis-simulaciones.js',
      'proyeccion-ui.js'
    ];

    for (const scriptName of scripts) {
      const ruta = `${AppConfig.RUTAS.JS}${scriptName}?v=${Date.now()}`;
      await resourceManager.inyectarScript(ruta);
    }

    window.poblarSimulaciones();
    const boton = document.getElementById('iniciarFetch');
    
    boton.addEventListener('click', () => {window.fetchSimulacion();});

  }

  limpiar(resourceManager) {
    resourceManager.limpiarScripts(AppConfig.SCRIPTS_PROYECCION);
    resourceManager.limpiarScripts(['poblar-simulaciones.js', 'mis-simulaciones.js', 'proyeccion-ui.js']);
  }
  
}

class VistaSimulacionProxSemestreStrategy extends VistaStrategy {
  getIdVista() {
    return 'simulacion-prox-semestre';
  }

  async cargar(areaContenido, servicios) {
    const { resourceManager } = servicios;

    resourceManager.limpiarScripts(AppConfig.SCRIPTS_MALLA);

    const respuesta = await fetch(`${AppConfig.RUTAS.HTML}simulacion-prox-semestre.html?v=${Date.now()}`);
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const htmlCompleto = await respuesta.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlCompleto, 'text/html');
    const bodyContent = doc.body ? doc.body.innerHTML : htmlCompleto;
    areaContenido.innerHTML = bodyContent;

    await resourceManager.inyectarScript(`${AppConfig.RUTAS.JS}simulacion-prox-semestre.js?v=${Date.now()}`);
  }

  limpiar(resourceManager) {
    resourceManager.limpiarScripts(['simulacion-prox-semestre.js']);
  }
}
class NavegacionService {
  constructor(resourceManager, renderService, usuarioService, apiService) {
    this.resourceManager = resourceManager;
    this.renderService = renderService;
    this.usuarioService = usuarioService;
    this.apiService = apiService;
    this.vistaActual = null;
    this.estrategias = new Map();
    this.areaContenido = null;
    this.contenidoInicio = null;
  }

  inicializar(areaContenido, contenidoInicio) {
    this.areaContenido = areaContenido;
    this.contenidoInicio = contenidoInicio;
    
    this.estrategias.set('inicio', new VistaInicioStrategy(contenidoInicio));
    this.estrategias.set('perfil', new VistaPerfilStrategy());
    this.estrategias.set('malla-actual', new VistaMallaActualStrategy());
    this.estrategias.set('historico', new VistaHistoricoStrategy());
    this.estrategias.set('proyeccion-testing', new VistaTestingStrategy());
    this.estrategias.set('simulacion-prox-semestre', new VistaSimulacionProxSemestreStrategy());
    this.estrategias.set('mis-simulaciones-egreso', new VistaMisSimulacionesEgreso());
  }

  obtenerServicios() {
    return {
      resourceManager: this.resourceManager,
      renderService: this.renderService,
      usuarioService: this.usuarioService,
      apiService: this.apiService
    };
  }

  async navegarA(idVista) {
    if (!this.areaContenido) {
      throw new Error('Área de contenido no inicializada');
    }

    const estrategia = this.estrategias.get(idVista);
    if (!estrategia) {
      throw new Error(`Vista ${idVista} no encontrada`);
    }

    if (this.vistaActual === idVista) {
      return;
    }

    if (this.vistaActual) {
      const estrategiaAnterior = this.estrategias.get(this.vistaActual);
      if (estrategiaAnterior) {
        estrategiaAnterior.limpiar(this.resourceManager);
      }
    }

    try {
      await estrategia.cargar(this.areaContenido, this.obtenerServicios());
      this.vistaActual = idVista;
    } catch (error) {
      console.error(`Error al cargar vista ${idVista}:`, error);
      const htmlError = this.renderService.generarError(
        `No se pudo cargar la vista: ${error.message}`,
        'Error al cargar'
      );
      this.areaContenido.innerHTML = htmlError;
      throw error;
    }
  }

  getVistaActual() {
    return this.vistaActual;
  }

  cargarInicio() {
    return this.navegarA('inicio');
  }
}

class BusquedaService {
  filtrarElementos(terminoBusqueda) {
    const seccionesMenu = document.querySelectorAll('.seccion-menu');
    const elementosInferior = document.querySelectorAll('.elemento-inferior');
    
    if (!terminoBusqueda) {
      this.mostrarTodos(seccionesMenu, elementosInferior);
      return;
    }

    this.filtrarSecciones(seccionesMenu, terminoBusqueda);
    this.filtrarElementosInferiores(elementosInferior, terminoBusqueda);
  }

  mostrarTodos(seccionesMenu, elementosInferior) {
    seccionesMenu.forEach(seccion => {
      seccion.style.display = '';
      seccion.querySelectorAll('.elemento-menu').forEach(elemento => {
        elemento.style.display = '';
      });
    });

    elementosInferior.forEach(elemento => {
      if (!elemento.classList.contains('cerrar-sesion')) {
        elemento.style.display = '';
      }
    });
  }

  filtrarSecciones(seccionesMenu, terminoBusqueda) {
    seccionesMenu.forEach(seccion => {
      const elementosMenu = seccion.querySelectorAll('.elemento-menu');
      let contadorVisibles = 0;

      elementosMenu.forEach(elemento => {
        const span = elemento.querySelector('span');
        if (span && span.textContent.toLowerCase().includes(terminoBusqueda)) {
          elemento.style.display = '';
          contadorVisibles++;
        } else {
          elemento.style.display = 'none';
        }
      });

      seccion.style.display = contadorVisibles > 0 ? '' : 'none';
    });
  }

  filtrarElementosInferiores(elementosInferior, terminoBusqueda) {
    elementosInferior.forEach(elemento => {
      if (!elemento.classList.contains('cerrar-sesion')) {
        const span = elemento.querySelector('span');
        if (span && span.textContent.toLowerCase().includes(terminoBusqueda)) {
          elemento.style.display = '';
        } else {
          elemento.style.display = 'none';
        }
      }
    });
  }
}

class MenuActivoService {
  establecer(tipoElemento) {
    const todosElementosMenu = document.querySelectorAll('.elemento-menu');
    todosElementosMenu.forEach(elemento => elemento.classList.remove('active'));

    const nombreUsuario = document.getElementById(AppConfig.IDS.NOMBRE_USUARIO);
    if (nombreUsuario) {
      nombreUsuario.classList.remove('active');
    }

    const mapeoTipos = {
      'profile': () => {
        if (nombreUsuario) nombreUsuario.classList.add('active');
      },
      'home': () => this.activarPorTexto('Malla Actual', todosElementosMenu),
      'malla-actual': () => this.activarPorTexto('Malla Actual', todosElementosMenu),
      'historico': () => this.activarPorTexto('Estadísticas - Histórico', todosElementosMenu),
      'proyeccion-testing': () => this.activarPorTexto('Proyección Testing', todosElementosMenu),
      'mis-simulaciones-egreso': () => this.activarPorTexto('Mis Simulaciones Egreso', todosElementosMenu),
      'simulacion-prox-semestre': () => this.activarPorTexto('Simulación Prox Semestre', todosElementosMenu)
    };

    const accion = mapeoTipos[tipoElemento];
    if (accion) {
      accion();
    }
  }

  activarPorTexto(textoBuscado, elementosMenu) {
    elementosMenu.forEach(elemento => {
      const span = elemento.querySelector('span');
      if (span && span.textContent.includes(textoBuscado)) {
        elemento.classList.add('active');
      }
    });
  }
}

class UsuarioUIService {
  mostrarInformacion(usuario) {
    const elementoNombreUsuario = document.getElementById(AppConfig.IDS.NOMBRE_USUARIO);
    if (elementoNombreUsuario && usuario.name) {
      elementoNombreUsuario.textContent = usuario.name;
    }

    const elementoAvatar = document.getElementById(AppConfig.IDS.AVATAR_USUARIO);
    if (elementoAvatar) {
      if (usuario.profilePicture) {
        const rutaImagen = `../${usuario.profilePicture}`;
        elementoAvatar.innerHTML = `<img src="${rutaImagen}" alt="${usuario.firstName || ''}">`;
      } else if (usuario.firstName) {
        elementoAvatar.textContent = usuario.firstName.charAt(0).toUpperCase();
      }
    }

    const elementoEmailUsuario = document.getElementById(AppConfig.IDS.CORREO_USUARIO);
    if (elementoEmailUsuario && usuario.email) {
      elementoEmailUsuario.textContent = usuario.email;
    }
  }

  configurarClicksPerfil(handler) {
    const nombreUsuario = document.getElementById(AppConfig.IDS.NOMBRE_USUARIO);
    const avatarUsuario = document.getElementById(AppConfig.IDS.AVATAR_USUARIO);

    if (nombreUsuario) {
      nombreUsuario.addEventListener('click', handler);
    }

    if (avatarUsuario) {
      avatarUsuario.style.cursor = 'pointer';
      avatarUsuario.title = 'Ver perfil';
      avatarUsuario.addEventListener('click', handler);
    }
  }
  
  configurarToggleBarra() {
  const barraLateral = document.getElementById(AppConfig.IDS.BARRA_LATERAL);
  const botonToggle = document.getElementById(AppConfig.IDS.BOTON_TOGGLE_BARRA);
  if (!barraLateral || !botonToggle) return;

  const icono = botonToggle.querySelector('i');
    const actualizarIcono = () => {
    if (!icono) return;
      if (barraLateral.classList.contains('retraida')) {
        icono.classList.remove('fa-bars');
        icono.classList.add('fa-arrow-right');
      } else {
        icono.classList.remove('fa-arrow-right');
        icono.classList.add('fa-bars');
      }
  };

    // Retracción única con animación (toggle de clase 'retraida')
    botonToggle.addEventListener('click', () => {
      // Añade clase temporal para sombra sutil durante el movimiento
      barraLateral.classList.add('moviendo');
      barraLateral.classList.toggle('retraida');
      actualizarIcono();
      // Quita la clase moviendo después de la transición
      setTimeout(() => barraLateral.classList.remove('moviendo'), 300);
    });

    actualizarIcono();
  }

}

class MainMenuApp {
  constructor() {
    this.storageService = new StorageService();
    this.apiService = new ApiService();
    this.renderService = new RenderService();
    this.resourceManager = new ResourceManager();
    this.usuarioService = new UsuarioService(this.storageService);
    this.navegacionService = new NavegacionService(
      this.resourceManager,
      this.renderService,
      this.usuarioService,
      this.apiService
    );
    this.busquedaService = new BusquedaService();
    this.menuActivoService = new MenuActivoService();
    this.usuarioUIService = new UsuarioUIService();
    this.areaContenido = null;
    this.contenidoInicio = null;
    this.inicializar();
  }

  inicializar() {
    this.areaContenido = document.querySelector(AppConfig.IDS.AREA_CONTENIDO);
    if (this.areaContenido) {
      this.contenidoInicio = this.areaContenido.innerHTML;
      this.navegacionService.inicializar(this.areaContenido, this.contenidoInicio);
    }

    this.cargarDatosUsuario();
    this.configurarEventos();
  }

  cargarDatosUsuario() {
    const usuario = this.usuarioService.obtenerUsuario();
    
    if (usuario) {
      this.usuarioUIService.mostrarInformacion(usuario);
    } else {
      this.redirigirAlInicioSesion();
    }
  }

  configurarEventos() {
    this.configurarCierreSesion();
    this.configurarBusqueda();
    this.configurarNavegacionPerfil();
    this.configurarNavegacionMallaActual();
    this.configurarNavegacionHistorico();
    this.configurarNavegacionTesting();
    this.configurarNavegacionSimulacionProxSemestre();
    this.configurarNavegacionAtras();
    this.configurarNavegacionMisSimulacionesEgreso();
    this.configurarToggleBarra();
  }

  configurarCierreSesion() {
    const botonCerrarSesion = document.getElementById(AppConfig.IDS.BOTON_CERRAR_SESION);
    if (botonCerrarSesion) {
      botonCerrarSesion.addEventListener('click', () => {
        this.realizarCierreSesion();
      });
    }
  }

  configurarToggleBarra() {
    const barraLateral = document.getElementById(AppConfig.IDS.BARRA_LATERAL);
    const botonToggle = document.getElementById(AppConfig.IDS.BOTON_TOGGLE_BARRA);
    if (!barraLateral || !botonToggle) return;

    const icono = botonToggle.querySelector('i');
    const actualizarIcono = () => {
      if (!icono) return;
      if (barraLateral.classList.contains('retraida')) {
        icono.classList.remove('fa-bars');
        icono.classList.add('fa-arrow-right');
      } else {
        icono.classList.remove('fa-arrow-right');
        icono.classList.add('fa-bars');
      }
    };

    const handler = () => {
      barraLateral.classList.add('moviendo');
      barraLateral.classList.toggle('retraida');
      actualizarIcono();
      setTimeout(() => barraLateral.classList.remove('moviendo'), 320);
    };

    botonToggle.addEventListener('click', handler);

    actualizarIcono();
  }

  realizarCierreSesion() {
    this.usuarioService.limpiarSesion();
    this.redirigirAlInicioSesion();
  }

  redirigirAlInicioSesion() {
    window.location.href = AppConfig.URLS.INDEX;
  }

  configurarBusqueda() {
    const entradaBusqueda = document.getElementById(AppConfig.IDS.ENTRADA_BUSQUEDA);
    if (entradaBusqueda) {
      entradaBusqueda.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();
        this.busquedaService.filtrarElementos(termino);
      });
    }
  }

  configurarNavegacionPerfil() {
    this.usuarioUIService.configurarClicksPerfil(() => {
      this.cargarPerfil();
      this.menuActivoService.establecer('profile');
    });
  }

  configurarNavegacionMisSimulacionesEgreso() {
    const elementosMenu = document.querySelectorAll('.elemento-menu');
    elementosMenu.forEach(elemento => {
      const texto = elemento.querySelector('span')?.textContent?.trim();
      if (texto === 'Mis Simulaciones Egreso') {
        elemento.addEventListener('click', () => {
          this.cargarMisSimulacionesEgreso();
          this.menuActivoService.establecer('mis-simulaciones-egreso');
        });
      }
    });
  }

  configurarNavegacionMallaActual() {
    const elementosMenu = document.querySelectorAll('.elemento-menu');
    elementosMenu.forEach(elemento => {
      const texto = elemento.querySelector('span')?.textContent;
      if (texto === 'Malla Actual') {
        elemento.addEventListener('click', () => {
          this.cargarMallaActual();
          this.menuActivoService.establecer('malla-actual');
        });
      }
    });
  }

  configurarNavegacionHistorico() {
    const elementosMenu = document.querySelectorAll('.elemento-menu');
    elementosMenu.forEach(elemento => {
      const texto = elemento.querySelector('span')?.textContent?.trim();
      if (texto === 'Estadísticas - Histórico') {
        const enlace = elemento.querySelector('a');
        const handler = (e) => {
          e.preventDefault();
          this.cargarHistorico();
          this.menuActivoService.establecer('historico');
        };

        if (enlace) {
          enlace.addEventListener('click', handler);
        } else {
          elemento.addEventListener('click', handler);
        }
      }
    });
  }

  configurarNavegacionTesting() {
    const elementosMenu = document.querySelectorAll('.elemento-menu');
    elementosMenu.forEach(elemento => {
      const texto = elemento.querySelector('span')?.textContent?.trim();
      if (texto === 'Proyección Testing') {
        elemento.addEventListener('click', (e) => {
          e.preventDefault();
          this.cargarTesting();
          this.menuActivoService.establecer('proyeccion-testing');
        });
      }
    });
  }

  configurarNavegacionSimulacionProxSemestre() {
    const elementosMenu = document.querySelectorAll('.elemento-menu');
    elementosMenu.forEach(elemento => {
      const texto = elemento.querySelector('span')?.textContent?.trim();
      if (texto === 'Simulación Prox Semestre') {
        elemento.addEventListener('click', (e) => {
          e.preventDefault();
          this.cargarSimulacionProxSemestre();
          this.menuActivoService.establecer('simulacion-prox-semestre');
        });
      }
    });
  }

  configurarNavegacionAtras() {
    window.addEventListener('navigateBack', () => {
      this.cargarInicio();
    });
  }

  async cargarPerfil() {
    try {
      await this.navegacionService.navegarA('perfil');
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  }

  async cargarMallaActual() {
    try {
      await this.navegacionService.navegarA('malla-actual');
    } catch (error) {
      console.error('Error al cargar malla actual:', error);
    }
  }

  cargarHistorico() {
    try {
      this.navegacionService.navegarA('historico');
    } catch (error) {
      console.error('Error al cargar histórico:', error);
    }
  }

  async cargarTesting() {
    try {
      await this.navegacionService.navegarA('proyeccion-testing');
    } catch (error) {
      console.error('Error al cargar testing:', error);
    }
  }

  async cargarSimulacionProxSemestre() {
    try {
      await this.navegacionService.navegarA('simulacion-prox-semestre');
    } catch (error) {
      console.error('Error al cargar simulación prox semestre:', error);
    }
  }

  cargarInicio() {
    try {
      this.navegacionService.cargarInicio();
      this.menuActivoService.establecer('home');
    } catch (error) {
      console.error('Error al cargar inicio:', error);
    }
  }

  cargarMisSimulacionesEgreso(){
    try {
      this.navegacionService.navegarA('mis-simulaciones-egreso');
    } catch (error) {
      console.error('Error al cargar mis simulaciones:', error);
    }
  }

  async realizarLoginYRedirigir(email, password) {
    try {
      const res = await this.apiService.login(email, password);
      if (res && res.rut) {
        this.usuarioService.guardarUsuario(res, email);
        window.location.href = AppConfig.URLS.MAIN_MENU;
      } else {
        throw new Error('Respuesta de login inválida');
      }
    } catch (error) {
      console.error('Error en realizarLoginYRedirigir:', error);
      throw error;
    }
  }

  guardarUsuarioEnSession(data, email) {
    return this.usuarioService.guardarUsuario(data, email);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mainMenuApp = new MainMenuApp();

  const botonTema = document.getElementById(AppConfig.IDS.BOTON_TEMA);
  if (botonTema && typeof temaManager !== 'undefined') {
    const actualizarIconoBoton = () => {
      const icono = botonTema.querySelector('i');
      const texto = botonTema.querySelector('span');
      if (!icono) return;

      const temaActual = temaManager.obtenerTemaActual();
      if (temaActual === 'dark') {
        icono.classList.remove('fa-moon');
        icono.classList.add('fa-sun');
        if (texto) texto.textContent = 'Modo Claro';
      } else {
        icono.classList.remove('fa-sun');
        icono.classList.add('fa-moon');
        if (texto) texto.textContent = 'Modo Oscuro';
      }
    };

    botonTema.addEventListener('click', () => {
      temaManager.alternarTema();
      actualizarIconoBoton();
    });

    actualizarIconoBoton();
  }

  // Fallback: asegurar toggle de barra aunque falle la inicialización previa
  // Eliminado fallback para evitar doble binding y estados conflictivos
});

if (typeof window !== 'undefined') {
  window.AppConfig = AppConfig;
  window.StorageService = StorageService;
  window.ApiService = ApiService;
  window.ResourceManager = ResourceManager;
  window.RenderService = RenderService;
  window.UsuarioService = UsuarioService;
  window.VistaStrategy = VistaStrategy;
  window.VistaInicioStrategy = VistaInicioStrategy;
  window.VistaPerfilStrategy = VistaPerfilStrategy;
  window.VistaMallaActualStrategy = VistaMallaActualStrategy;
  window.VistaHistoricoStrategy = VistaHistoricoStrategy;
  window.VistaTestingStrategy = VistaTestingStrategy;
  window.VistaMisSimulaciones = VistaMisSimulacionesEgreso;
  window.NavegacionService = NavegacionService;
  window.BusquedaService = BusquedaService;
  window.MenuActivoService = MenuActivoService;
  window.UsuarioUIService = UsuarioUIService;
  window.MainMenuApp = MainMenuApp;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    MainMenuApp, 
    AppConfig,
    StorageService,
    ApiService,
    ResourceManager,
    RenderService,
    UsuarioService,
    VistaStrategy,
    VistaInicioStrategy,
    VistaPerfilStrategy,
    VistaMallaActualStrategy,
    VistaHistoricoStrategy,
    VistaTestingStrategy,
    VistaMisSimulacionesEgreso,
    NavegacionService,
    BusquedaService,
    MenuActivoService,
    UsuarioUIService
  };
}
