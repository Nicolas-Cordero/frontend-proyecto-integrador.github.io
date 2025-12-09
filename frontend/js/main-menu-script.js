// ===== CONFIGURACIÓN Y CONSTANTES =====
const CLAVES_ALMACENAMIENTO = {
  DATOS_USUARIO: 'ucn_user_data'
  // Solo sessionStorage para desarrollo
};

// ===== CLASE PRINCIPAL DEL MENÚ =====
class MainMenuApp {
  constructor() {
    this.areaContenido = null;
    this.contenidoInicio = null;
    this.inicializar();
  }

  // Inicialización de la aplicación
  inicializar() {
    this.areaContenido = document.querySelector('.area-contenido');
    if (this.areaContenido) {
      // Guardar el contenido original del home
      this.contenidoInicio = this.areaContenido.innerHTML;
    }
    
    this.cargarDatosUsuario();
    this.configurarCierreSesion();
    this.configurarBusqueda();
    this.configurarNavegacionPerfil();
    this.configurarNavegacionMallaActual();
    this.configurarNavegacionHistorico();
    this.configurarNavegacionAtras();
  }

    // ===== CARGA DE DATOS DEL USUARIO =====
  cargarDatosUsuario() {
    // Solo sessionStorage
    const datosUsuario = sessionStorage.getItem(CLAVES_ALMACENAMIENTO.DATOS_USUARIO);
    
    if (datosUsuario) {
      try {
        const usuario = JSON.parse(datosUsuario);
  console.log('📥 Usuario cargado desde sessionStorage:', usuario);
  this.mostrarInformacionUsuario(usuario);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    } else {
      console.warn('No hay datos de usuario disponibles');
      this.redirigirAlInicioSesion();
    }
  }

  // ===== MÉTODOS DE AUTENTICACIÓN / INTEGRACIÓN CON API =====
  async fetchJsonLenient(url, options = {}) {
    const resp = await fetch(url, options);
    const text = await resp.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`Respuesta inválida JSON desde ${url}: ${text}`);
    }
  }

  async apiLogin(email, password) {
    const loginUrl = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    try {
      const data = await this.fetchJsonLenient(loginUrl);
      if (data && data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (err) {
      console.error('Error en apiLogin:', err);
      throw err;
    }
  }

  // Guardar en sessionStorage la estructura mínima que usa la UI
  guardarUsuarioEnSession(data, email) {
    const usuario = {
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

    sessionStorage.setItem(CLAVES_ALMACENAMIENTO.DATOS_USUARIO, JSON.stringify(usuario));
    console.log('✅ Usuario guardado en sessionStorage:', usuario);
    this.mostrarInformacionUsuario(usuario);
  }

  // Función utilizable desde la página de login para disparar el login real
  async realizarLoginYRedirigir(email, password) {
    try {
      const res = await this.apiLogin(email, password);
      if (res && res.rut) {
        this.guardarUsuarioEnSession(res, email);
        // Redirigir al main-menu una vez autenticado
        window.location.href = 'html/main-menu.html';
      } else {
        throw new Error('Respuesta de login inválida');
      }
    } catch (err) {
      console.error('Error en realizarLoginYRedirigir:', err);
      throw err;
    }
  }

    // ===== VISUALIZACIÓN DE INFORMACIÓN DEL USUARIO =====
  mostrarInformacionUsuario(usuario) {
    // Actualizar nombre de usuario
    const elementoNombreUsuario = document.getElementById('nombreUsuario');
    if (elementoNombreUsuario && usuario.name) {
      elementoNombreUsuario.textContent = usuario.name;
    }
    
    // Actualizar avatar con imagen o inicial
    const elementoAvatar = document.getElementById('avatarUsuario');
    if (elementoAvatar) {
      if (usuario.profilePicture) {
        // Construir ruta relativa desde html/main-menu.html
        const rutaImagen = `../${usuario.profilePicture}`;
        elementoAvatar.innerHTML = `<img src="${rutaImagen}" alt="${usuario.firstName}">`;
      } else if (usuario.firstName) {
        elementoAvatar.textContent = usuario.firstName.charAt(0).toUpperCase();
      }
    }
    
    // Actualizar email en el contenido
    const elementoEmailUsuario = document.getElementById('correoUsuario');
    if (elementoEmailUsuario && usuario.email) {
      elementoEmailUsuario.textContent = usuario.email;
    }
  }

  // ===== GESTIÓN DE LOGOUT =====
  configurarCierreSesion() {
    const botonCerrarSesion = document.getElementById('botonCerrarSesion');
    if (botonCerrarSesion) {
      botonCerrarSesion.addEventListener('click', this.realizarCierreSesion.bind(this));
    }
  }

  realizarCierreSesion() {
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    console.log('✅ Sesión cerrada exitosamente');
    
    // Redirigir al login
    this.redirigirAlInicioSesion();
  }

  redirigirAlInicioSesion() {
    window.location.href = 'index.html';
  }

  // ===== FUNCIONALIDAD DE BÚSQUEDA =====
  configurarBusqueda() {
    const entradaBusqueda = document.getElementById('entradaBusqueda');
    if (entradaBusqueda) {
      entradaBusqueda.addEventListener('input', (e) => {
        this.manejarBusqueda(e.target.value);
      });
    }
  }

  manejarBusqueda(valorBusqueda) {
    const terminoBusqueda = valorBusqueda.toLowerCase().trim();
    
    // Obtener todos los elementos del menú
    const seccionesMenu = document.querySelectorAll('.seccion-menu');
    const elementosInferior = document.querySelectorAll('.elemento-inferior');
    
    // Si no hay término de búsqueda, mostrar todo
    if (terminoBusqueda === '') {
      this.mostrarTodosLosElementosMenu(seccionesMenu, elementosInferior);
      return;
    }
    
    // Filtrar elementos del menú principal
    this.filtrarSeccionesMenu(seccionesMenu, terminoBusqueda);
    
    // Filtrar elementos del footer (excepto logout)
    this.filtrarElementosInferiores(elementosInferior, terminoBusqueda);
  }

  mostrarTodosLosElementosMenu(seccionesMenu, elementosInferior) {
    seccionesMenu.forEach(seccion => {
      seccion.style.display = '';
      const elementosMenu = seccion.querySelectorAll('.elemento-menu');
      elementosMenu.forEach(elemento => elemento.style.display = '');
    });
    
    elementosInferior.forEach(elemento => {
      if (!elemento.classList.contains('cerrar-sesion')) {
        elemento.style.display = '';
      }
    });
  }

  filtrarSeccionesMenu(seccionesMenu, terminoBusqueda) {
    seccionesMenu.forEach(seccion => {
      const elementosMenu = seccion.querySelectorAll('.elemento-menu');
      let contadorElementosVisibles = 0;
      
      elementosMenu.forEach(elemento => {
        const texto = elemento.querySelector('span').textContent.toLowerCase();
        if (texto.includes(terminoBusqueda)) {
          elemento.style.display = '';
          contadorElementosVisibles++;
        } else {
          elemento.style.display = 'none';
        }
      });
      
      // Ocultar sección completa si no tiene elementos visibles
      if (contadorElementosVisibles === 0) {
        seccion.style.display = 'none';
      } else {
        seccion.style.display = '';
      }
    });
  }

  filtrarElementosInferiores(elementosInferior, terminoBusqueda) {
    elementosInferior.forEach(elemento => {
      if (!elemento.classList.contains('cerrar-sesion')) {
        const texto = elemento.querySelector('span').textContent.toLowerCase();
        if (texto.includes(terminoBusqueda)) {
          elemento.style.display = '';
        } else {
          elemento.style.display = 'none';
        }
      }
    });
  }

  // ===== NAVEGACIÓN AL PERFIL =====
  configurarNavegacionPerfil() {
    const nombreUsuario = document.getElementById('nombreUsuario');
    const avatarUsuario = document.getElementById('avatarUsuario');
    
    if (nombreUsuario) {
      nombreUsuario.addEventListener('click', () => {
        this.cargarPerfil();
        this.establecerElementoMenuActivo('profile');
      });
    }
    
    if (avatarUsuario) {
      avatarUsuario.style.cursor = 'pointer';
      avatarUsuario.title = 'Ver perfil';
      avatarUsuario.addEventListener('click', () => {
        this.cargarPerfil();
        this.establecerElementoMenuActivo('profile');
      });
    }
  }

  // ===== NAVEGACIÓN A MALLA ACTUAL =====
  configurarNavegacionMallaActual() {
    const elementosMenu = document.querySelectorAll('.elemento-menu');
    
    elementosMenu.forEach(elemento => {
      const textoElemento = elemento.querySelector('span')?.textContent;
      if (textoElemento === 'Malla Actual') {
        elemento.addEventListener('click', () => {
          this.cargarMallaActual();
          this.establecerElementoMenuActivo('malla-actual');
        });
      }
    });
  }

  // ===== NAVEGACIÓN A HISTÓRICO =====
  configurarNavegacionHistorico() {
    const elementosMenu = document.querySelectorAll('.elemento-menu');

    elementosMenu.forEach(elemento => {
      const textoElemento = elemento.querySelector('span')?.textContent?.trim();
      if (textoElemento === 'Estadísticas - Histórico') {
        // Si el elemento contiene un <a>, interceptamos su click para evitar navegación
        const enlace = elemento.querySelector('a');
        if (enlace) {
          enlace.addEventListener('click', (e) => {
            e.preventDefault();
            this.cargarHistorico();
            this.establecerElementoMenuActivo('historico');
          });
        } else {
          elemento.addEventListener('click', (e) => {
            e.preventDefault();
            this.cargarHistorico();
            this.establecerElementoMenuActivo('historico');
          });
        }
      }
    });
  }

  async cargarPerfil() {
    if (!this.areaContenido) return;

    // Limpiar scripts de mallas
    this.limpiarScriptsMallas();

    try {
      // Obtener datos del usuario (SOLO sessionStorage)
      const datosUsuario = sessionStorage.getItem(CLAVES_ALMACENAMIENTO.DATOS_USUARIO);
      
      if (!datosUsuario) {
        throw new Error('No hay datos de usuario disponibles');
      }

      const usuario = JSON.parse(datosUsuario);
      console.log('📄 Cargando perfil para usuario:', usuario);

      // Generar HTML del perfil directamente
  const htmlPerfil = this.generarHTMLPerfil(usuario);
      this.areaContenido.innerHTML = htmlPerfil;

      // Configurar botón de volver
      const botonVolver = document.getElementById('volverInicio');
      if (botonVolver) {
        botonVolver.addEventListener('click', () => {
          const evento = new CustomEvent('navigateBack');
          window.dispatchEvent(evento);
        });
      }

      console.log('✅ Perfil cargado exitosamente');

    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      this.areaContenido.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
          <h2 style="color: #1e293b; margin-bottom: 1rem;">Error al cargar el perfil</h2>
          <p style="color: #64748b; margin-bottom: 2rem;">No se pudo cargar la información del perfil.</p>
          <button onclick="window.mainMenuApp.cargarInicio()" style="padding: 0.75rem 2rem; background: #667eea; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
            Volver al inicio
          </button>
        </div>
      `;
    }
  }

  // ===== NAVEGACIÓN A MALLA ACTUAL =====
  
  async cargarMallaActual() {
    if (!this.areaContenido) return;
    
    // Asegurar que no quede cargado el CSS específico de histórico (scoped)
    const estiloHistoricoExistente = document.getElementById('historico-scoped-style');
    if (estiloHistoricoExistente) estiloHistoricoExistente.remove();

    console.log('📊 Cargando Malla Actual...');

    try {
      const respuesta = await fetch('../html/malla-actual.html');
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
      const htmlCompleto = await respuesta.text();
      
      // Extraer el contenido del body
      const parserDOM = new DOMParser();
      const docParsed = parserDOM.parseFromString(htmlCompleto, 'text/html');
      const bodyContent = docParsed.body.innerHTML;
      
      this.areaContenido.innerHTML = bodyContent;
      
      // Configurar APP_CONFIG global ANTES de cargar scripts
      window.APP_CONFIG = {
        API_URL: 'http://localhost:3000/api/mallas',
        TIMEOUT_MS: 10000,
        CONTAINER_ID: 'contenedorMalla'
      };
      
      // Cargar los scripts necesarios en orden
      const scripts = ['mallas-api.js', 'mallas-ui.js', 'mallas.js'];
      for (const scriptName of scripts) {
        const script = document.createElement('script');
        script.src = `../js/${scriptName}?v=${Date.now()}`;
        document.body.appendChild(script);
      }
      
      console.log('✅ Malla Actual cargada exitosamente');
    } catch (error) {
      console.error('Error al cargar Malla Actual:', error);
      this.areaContenido.innerHTML = `<div style="padding: 2rem; text-align: center;"><h2>Error al cargar la malla</h2><button onclick="window.mainMenuApp.cargarInicio()">Volver</button></div>`;
    }
  }

  // ===== CARGAR VISTA DE HISTÓRICO DENTRO DEL ÁREA DE CONTENIDO =====
  cargarHistorico() {
    if (!this.areaContenido) return;

    // Limpiar scripts de mallas
    this.limpiarScriptsMallas();

    console.log('📥 Cargando vista de Histórico en area-contenido...');
    // Inyectar stylesheet acotado para la vista histórico (no altera layout global)
    const head = document.head || document.getElementsByTagName('head')[0];
    const estiloId = 'historico-scoped-style';
    const existenteEstilo = document.getElementById(estiloId);
    if (existenteEstilo) {
      existenteEstilo.href = '../css/historico-scoped.css?v=' + Date.now();
    } else {
      const link = document.createElement('link');
      link.id = estiloId;
      link.rel = 'stylesheet';
      link.href = '../css/historico-scoped.css?v=' + Date.now();
      head.appendChild(link);
    }
    const htmlHistorico = `
      <div>
        <header>
          <h1 class="page-title">Histórico de Proyecciones</h1>
          <p class="subtitle">Vista vacía — agrega proyecciones para ver columnas de ramos aquí.</p>
        </header>

        <section class="card" aria-labelledby="cardTitle">
          <div class="card-header">
            <div id="cardTitle"><strong>Proyecciones</strong></div>
          </div>

          <div class="hscroll-wrap" aria-live="polite">
            <div class="columnas" id="contenedorColumnas"></div>
          </div>
        </section>
      </div>
    `;

    this.areaContenido.innerHTML = htmlHistorico;

    // Cargar los scripts modulares de histórico de forma dinámica
    // Orden: AvanceAPI -> API -> Render -> App (en orden de dependencia)
    const scriptIds = ['historico-avance-api', 'historico-api', 'historico-render', 'historico-app'];
    const scripts = [
      '../js/historico-avance-api.js?v=' + Date.now(),
      '../js/historico-api.js?v=' + Date.now(),
      '../js/historico-render.js?v=' + Date.now(),
      '../js/historico-app.js?v=' + Date.now()
    ];

    // Remover scripts existentes
    scriptIds.forEach(id => {
      const existente = document.getElementById(id);
      if (existente) existente.remove();
    });

    // Cargar scripts en orden
    let scriptIndex = 0;
    const cargarSiguiente = () => {
      if (scriptIndex >= scripts.length) {
        console.log('✅ Vista de Histórico cargada con todos los módulos');
        return;
      }

      const script = document.createElement('script');
      script.id = scriptIds[scriptIndex];
      script.src = scripts[scriptIndex];
      script.onload = () => {
        scriptIndex++;
        cargarSiguiente();
      };
      script.onerror = () => {
        console.error('❌ Error cargando script:', scripts[scriptIndex]);
      };
      document.body.appendChild(script);
    };

    cargarSiguiente();
  }

  generarHTMLPerfil(usuario) {
    // 🔍 DEBUG: Ver qué datos llegan
    console.log('🔍 DEBUG - Datos del usuario:', usuario);
    console.log('🔍 DEBUG - academicInfo:', usuario.academicInfo);
    
    const nombreCompleto = usuario.name || `${usuario.firstName || ''} ${usuario.lastName || ''}`.trim();
    const nombre = usuario.firstName || 'Usuario';
    const avatar = nombre.charAt(0).toUpperCase();
    const rol = usuario.role === 'student' ? 'Estudiante' : usuario.role === 'admin' ? 'Administrador' : 'Usuario';
    const correo = usuario.email || 'No disponible';
    const nombreUsuario = usuario.username || 'No disponible';
    const rut = usuario.rut || 'No disponible';
    
    // ✅ Imagen de perfil o fallback a inicial
    const fotoPerfil = usuario.profilePicture;
    // Construir ruta relativa desde html/main-menu.html (o donde se cargue el perfil)
    const rutaImagen = fotoPerfil ? `../${fotoPerfil}` : null;
    const contenidoAvatar = rutaImagen 
      ? `<img src="${rutaImagen}" alt="${nombre}">` 
      : avatar;
    
    // Datos académicos (con valores por defecto si no existen)
    const informacionAcademica = usuario.academicInfo || {};
    const carrera = informacionAcademica.career || 'No especificada';
    const generacion = informacionAcademica.generation || 'No especificada';
    const semestreActual = informacionAcademica.currentSemester || 0;
    const semestresTotales = informacionAcademica.totalSemesters || 10;
    const promedio = informacionAcademica.gpa || 0;
    const ramosAprobados = informacionAcademica.approvedCourses || 0;
    const ramosActuales = informacionAcademica.currentCourses || 0;
    
    // ✅ Cálculo DINÁMICO del avance curricular basado en semestres
    const progresoCurricular = semestresTotales > 0 
      ? Math.round((semestreActual / semestresTotales) * 100) 
      : 0;
    
    // Cálculo dinámico de semestres restantes
    const semestresRestantes = Math.max(0, semestresTotales - semestreActual);
    
    // 🔍 DEBUG: Ver valores calculados
    console.log('🔍 DEBUG - Valores calculados:', {
      carrera,
      generacion,
      semestreActual,
      promedio,
      ramosAprobados,
      ramosActuales,
      progresoCurricular,
      semestresRestantes
    });

    return `
      <div class="contenedor-perfil">
        <!-- Header del perfil -->
        <div class="cabecera-perfil">
          <button class="boton-volver" id="volverInicio">
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </button>
          <h1>Perfil de Usuario</h1>
        </div>

        <!-- Información principal del usuario -->
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

        <!-- Detalles del usuario en cards -->
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

          <div class="tarjeta-detalle">
            <div class="cabecera-tarjeta-detalle">
              <i class="fas fa-chart-line"></i>
              <h3>Estadísticas</h3>
            </div>
            <div class="cuerpo-tarjeta-detalle">
              <div class="cuadricula-estadisticas">
                <div class="elemento-estadistica">
                  <i class="fas fa-book"></i>
                  <div class="contenido-estadistica">
                    <span class="numero-estadistica">${ramosAprobados}</span>
                    <span class="etiqueta-estadistica">Ramos aprobados</span>
                  </div>
                </div>
                <div class="elemento-estadistica">
                  <i class="fas fa-clock"></i>
                  <div class="contenido-estadistica">
                    <span class="numero-estadistica">${ramosActuales}</span>
                    <span class="etiqueta-estadistica">Ramos actuales</span>
                  </div>
                </div>
                <div class="elemento-estadistica">
                  <i class="fas fa-trophy"></i>
                  <div class="contenido-estadistica">
                    <span class="numero-estadistica">${progresoCurricular}%</span>
                    <span class="etiqueta-estadistica">Avance curricular</span>
                  </div>
                </div>
                <div class="elemento-estadistica">
                  <i class="fas fa-calendar-check"></i>
                  <div class="contenido-estadistica">
                    <span class="numero-estadistica">${semestresRestantes}</span>
                    <span class="etiqueta-estadistica">Semestres restantes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones del perfil -->
        <div class="acciones-perfil">
          <button class="boton-accion primario" onclick="alert('Función de edición de perfil próximamente')">
            <i class="fas fa-edit"></i>
            <span>Editar Perfil</span>
          </button>
          <button class="boton-accion secundario" onclick="alert('Función de cambio de contraseña próximamente')">
            <i class="fas fa-key"></i>
            <span>Cambiar Contraseña</span>
          </button>
          <button class="boton-accion secundario" onclick="alert('Configuración de notificaciones próximamente')">
            <i class="fas fa-bell"></i>
            <span>Notificaciones</span>
          </button>
        </div>
      </div>
    `;
  }

  configurarNavegacionAtras() {
    // Escuchar evento de navegación hacia atrás
    window.addEventListener('navigateBack', () => {
      this.cargarInicio();
    });
  }

  cargarInicio() {
    if (!this.areaContenido || !this.contenidoInicio) return;
    
    // Limpiar scripts de mallas
    this.limpiarScriptsMallas();
    
    // Asegurar que no quede cargado el CSS específico de histórico (scoped)
    const estiloHistoricoExistente = document.getElementById('historico-scoped-style');
    if (estiloHistoricoExistente) estiloHistoricoExistente.remove();
    
    this.areaContenido.innerHTML = this.contenidoInicio;
    
    // Restaurar highlight a "Malla Actual"
    this.establecerElementoMenuActivo('home');
    
    console.log('✅ Volviendo al home');
  }

  // ===== LIMPIAR SCRIPTS DE MALLAS =====
  limpiarScriptsMallas() {
    const mallasScripts = ['mallas-api.js', 'mallas-ui.js', 'mallas.js'];
    const todosLosScripts = document.querySelectorAll('script');
    
    todosLosScripts.forEach(script => {
      for (const mallasScript of mallasScripts) {
        if (script.src.includes(mallasScript)) {
          script.remove();
        }
      }
    });
  }

  establecerElementoMenuActivo(tipoElemento) {
    // Remover clase active de todos los menu-items
    const todosElementosMenu = document.querySelectorAll('.elemento-menu');
    todosElementosMenu.forEach(elemento => elemento.classList.remove('active'));
    
    // Remover clase active del nombre de usuario
    const nombreUsuario = document.getElementById('nombreUsuario');
    if (nombreUsuario) {
      nombreUsuario.classList.remove('active');
    }
    
    // Agregar clase active según el tipo
    if (tipoElemento === 'profile') {
      if (nombreUsuario) {
        nombreUsuario.classList.add('active');
      }
    } else if (tipoElemento === 'home') {
      // Buscar el menu-item que contiene "Malla Actual" y activarlo
      const elementosMenu = document.querySelectorAll('.elemento-menu');
      elementosMenu.forEach(elemento => {
        const span = elemento.querySelector('span');
        if (span && span.textContent.includes('Malla Actual')) {
          elemento.classList.add('active');
        }
      });
    } else if (tipoElemento === 'malla-actual') {
      // Buscar el menu-item que contiene "Malla Actual" y activarlo
      const elementosMenu = document.querySelectorAll('.elemento-menu');
      elementosMenu.forEach(elemento => {
        const span = elemento.querySelector('span');
        if (span && span.textContent.includes('Malla Actual')) {
          elemento.classList.add('active');
        }
      });
    } else if (tipoElemento === 'historico') {
      const elementosMenu = document.querySelectorAll('.elemento-menu');
      elementosMenu.forEach(elemento => {
        const span = elemento.querySelector('span');
        if (span && span.textContent.includes('Estadísticas - Histórico')) {
          elemento.classList.add('active');
        }
      });
    }
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar aplicación del menú principal
  window.mainMenuApp = new MainMenuApp();

  // Log de información del sistema
  console.log('Sistema de menú principal inicializado');
  console.log('Versión: 1.0.0');
});

// ===== EXPORTAR PARA TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MainMenuApp, CLAVES_ALMACENAMIENTO };
}
