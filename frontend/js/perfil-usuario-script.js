class PerfilConfig {
  static CLAVES = {
    DATOS_USUARIO: 'ucn_user_data'
  };

  static IDS = {
    AVATAR_GRANDE: 'avatarPerfilGrande',
    NOMBRE_COMPLETO_PERFIL: 'nombreCompletoPerfil',
    ROL_PERFIL: 'rolPerfil',
    CORREO_PERFIL: 'correoPerfil',
    NOMBRE_COMPLETO_DETALLE: 'nombreCompletoDetalle',
    RUT_DETALLE: 'rutDetalle',
    NOMBRE_USUARIO_DETALLE: 'nombreUsuarioDetalle',
    CORREO_DETALLE: 'correoDetalle',
    CARRERA_DETALLE: 'carreraDetalle',
    GENERACION_DETALLE: 'generacionDetalle',
    NIVEL_ACTUAL_DETALLE: 'nivelActualDetalle',
    PROMEDIO_DETALLE: 'promedioDetalle',
    BOTON_VOLVER: 'volverInicio'
  };

  static TRADUCCIONES_ROL = {
    'student': 'Estudiante',
    'admin': 'Administrador',
    'teacher': 'Profesor'
  };

  static VALORES_POR_DEFECTO = {
    ROL: 'Usuario',
    CARRERA: 'No especificada',
    GENERACION: 'No especificada',
    NIVEL: 'No especificado',
    PROMEDIO: '0.0'
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

class UsuarioService {
  constructor(storageService, claveUsuario) {
    this.storageService = storageService;
    this.claveUsuario = claveUsuario;
  }

  obtenerUsuario() {
    return this.storageService.getItem(this.claveUsuario);
  }

  validarSesion() {
    const usuario = this.obtenerUsuario();
    return usuario !== null;
  }
}

class PerfilDataService {
  constructor(usuarioService) {
    this.usuarioService = usuarioService;
  }

  obtenerDatosUsuario() {
    return this.usuarioService.obtenerUsuario();
  }

  formatearNombreCompleto(usuario) {
    if (usuario.name) {
      return usuario.name;
    }
    const nombre = usuario.firstName || '';
    const apellido = usuario.lastName || '';
    return `${nombre} ${apellido}`.trim() || 'Usuario';
  }

  formatearRol(usuario) {
    if (!usuario.role) {
      return PerfilConfig.VALORES_POR_DEFECTO.ROL;
    }
    return PerfilConfig.TRADUCCIONES_ROL[usuario.role] || usuario.role;
  }

  obtenerInicialAvatar(usuario) {
    const nombre = usuario.firstName || usuario.name || 'U';
    return nombre.charAt(0).toUpperCase();
  }

  obtenerInformacionAcademica(usuario) {
    const academicInfo = usuario.academicInfo || {};
    return {
      carrera: academicInfo.career || PerfilConfig.VALORES_POR_DEFECTO.CARRERA,
      generacion: academicInfo.generation || PerfilConfig.VALORES_POR_DEFECTO.GENERACION,
      nivelActual: academicInfo.currentSemester || 0,
      promedio: academicInfo.gpa || 0
    };
  }

  validarDatosUsuario(usuario) {
    if (!usuario) {
      return { valido: false, error: 'No hay datos de usuario disponibles' };
    }
    return { valido: true, error: null };
  }
}

class PerfilRenderService {
  constructor(perfilDataService) {
    this.perfilDataService = perfilDataService;
  }

  actualizarAvatar(usuario) {
    const elemento = document.getElementById(PerfilConfig.IDS.AVATAR_GRANDE);
    if (!elemento) return;

    const inicial = this.perfilDataService.obtenerInicialAvatar(usuario);
    elemento.textContent = inicial;
  }

  actualizarNombreCompleto(usuario, elementoId) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    const nombreCompleto = this.perfilDataService.formatearNombreCompleto(usuario);
    elemento.textContent = nombreCompleto;
  }

  actualizarRol(usuario) {
    const elemento = document.getElementById(PerfilConfig.IDS.ROL_PERFIL);
    if (!elemento) return;

    const rol = this.perfilDataService.formatearRol(usuario);
    elemento.textContent = rol;
  }

  actualizarCorreo(usuario, elementoId) {
    const elemento = document.getElementById(elementoId);
    if (!elemento || !usuario.email) return;

    elemento.textContent = usuario.email;
  }

  actualizarRut(usuario) {
    const elemento = document.getElementById(PerfilConfig.IDS.RUT_DETALLE);
    if (!elemento || !usuario.rut) return;

    elemento.textContent = usuario.rut;
  }

  actualizarNombreUsuario(usuario) {
    const elemento = document.getElementById(PerfilConfig.IDS.NOMBRE_USUARIO_DETALLE);
    if (!elemento || !usuario.username) return;

    elemento.textContent = usuario.username;
  }

  actualizarInformacionAcademica(usuario) {
    const infoAcademica = this.perfilDataService.obtenerInformacionAcademica(usuario);

    const carreraElemento = document.getElementById(PerfilConfig.IDS.CARRERA_DETALLE);
    if (carreraElemento) {
      carreraElemento.textContent = infoAcademica.carrera;
    }

    const generacionElemento = document.getElementById(PerfilConfig.IDS.GENERACION_DETALLE);
    if (generacionElemento) {
      generacionElemento.textContent = infoAcademica.generacion;
    }

    const nivelElemento = document.getElementById(PerfilConfig.IDS.NIVEL_ACTUAL_DETALLE);
    if (nivelElemento) {
      const nivelTexto = infoAcademica.nivelActual > 0 
        ? `${infoAcademica.nivelActual}° Semestre`
        : PerfilConfig.VALORES_POR_DEFECTO.NIVEL;
      nivelElemento.textContent = nivelTexto;
    }

    const promedioElemento = document.getElementById(PerfilConfig.IDS.PROMEDIO_DETALLE);
    if (promedioElemento) {
      const promedioTexto = infoAcademica.promedio > 0
        ? infoAcademica.promedio.toFixed(1)
        : PerfilConfig.VALORES_POR_DEFECTO.PROMEDIO;
      promedioElemento.textContent = promedioTexto;
    }
  }

  renderizarPerfilCompleto(usuario) {
    this.actualizarAvatar(usuario);
    this.actualizarNombreCompleto(usuario, PerfilConfig.IDS.NOMBRE_COMPLETO_PERFIL);
    this.actualizarNombreCompleto(usuario, PerfilConfig.IDS.NOMBRE_COMPLETO_DETALLE);
    this.actualizarRol(usuario);
    this.actualizarCorreo(usuario, PerfilConfig.IDS.CORREO_PERFIL);
    this.actualizarCorreo(usuario, PerfilConfig.IDS.CORREO_DETALLE);
    this.actualizarRut(usuario);
    this.actualizarNombreUsuario(usuario);
    this.actualizarInformacionAcademica(usuario);
  }
}

class PerfilEventService {
  configurarBotonVolver() {
    const botonVolver = document.getElementById(PerfilConfig.IDS.BOTON_VOLVER);
    if (!botonVolver) return;

    botonVolver.addEventListener('click', () => {
      const evento = new CustomEvent('navigateBack');
      window.dispatchEvent(evento);
    });
  }

  configurarBotonesAccion() {
    const botonCambiarAvatar = document.querySelector('.boton-cambiar-avatar');
    if (botonCambiarAvatar) {
      botonCambiarAvatar.addEventListener('click', () => {
        console.log('Cambiar avatar - funcionalidad pendiente de implementación');
      });
    }
  }
}

class AplicacionPerfilUsuario {
  constructor() {
    this.storageService = new StorageService();
    this.usuarioService = new UsuarioService(
      this.storageService,
      PerfilConfig.CLAVES.DATOS_USUARIO
    );
    this.perfilDataService = new PerfilDataService(this.usuarioService);
    this.perfilRenderService = new PerfilRenderService(this.perfilDataService);
    this.perfilEventService = new PerfilEventService();
    this.datosUsuario = null;
    this.inicializar();
  }

  inicializar() {
    this.cargarDatosUsuario();
    this.configurarEventos();
  }

  cargarDatosUsuario() {
    this.datosUsuario = this.usuarioService.obtenerUsuario();

    const validacion = this.perfilDataService.validarDatosUsuario(this.datosUsuario);
    if (!validacion.valido) {
      console.warn(validacion.error);
      return;
    }

    this.mostrarPerfilUsuario();
  }

  mostrarPerfilUsuario() {
    if (!this.datosUsuario) return;

    try {
      this.perfilRenderService.renderizarPerfilCompleto(this.datosUsuario);
    } catch (error) {
      console.error('Error al renderizar perfil:', error);
    }
  }

  configurarEventos() {
    this.perfilEventService.configurarBotonVolver();
    this.perfilEventService.configurarBotonesAccion();
  }
}

if (document.getElementById(PerfilConfig.IDS.AVATAR_GRANDE)) {
  window.aplicacionPerfilUsuario = new AplicacionPerfilUsuario();
}

if (typeof window !== 'undefined') {
  window.PerfilConfig = PerfilConfig;
  window.StorageService = StorageService;
  window.UsuarioService = UsuarioService;
  window.PerfilDataService = PerfilDataService;
  window.PerfilRenderService = PerfilRenderService;
  window.PerfilEventService = PerfilEventService;
  window.AplicacionPerfilUsuario = AplicacionPerfilUsuario;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    AplicacionPerfilUsuario, 
    PerfilConfig,
    StorageService,
    UsuarioService,
    PerfilDataService,
    PerfilRenderService,
    PerfilEventService
  };
}
