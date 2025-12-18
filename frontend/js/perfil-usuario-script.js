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

if (typeof StorageService === 'undefined') {
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
  window.StorageService = StorageService;
}

if (typeof window.UsuarioService === 'undefined') {
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
  window.UsuarioService = UsuarioService;
}

class FotoPerfilService {
  static URL_BASE_API = 'http://localhost:4000/api';

  static async subirFoto(rut, archivo) {
    if (!rut || !archivo) {
      throw new Error('RUT y archivo son requeridos');
    }

    const formData = new FormData();
    formData.append('foto', archivo);

    try {
      const respuesta = await fetch(`${this.URL_BASE_API}/estudiantes/${rut}/foto`, {
        method: 'POST',
        body: formData
      });

      if (!respuesta.ok) {
        const error = await respuesta.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || 'Error al subir la foto');
      }

      const resultado = await respuesta.json();
      return resultado;
    } catch (error) {
      throw error;
    }
  }

  static obtenerUrlFoto(rut) {
    if (!rut) {
      return null;
    }
    return `${this.URL_BASE_API}/estudiantes/${rut}/foto`;
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

    elemento.innerHTML = '';
    elemento.textContent = '';

    if (usuario.foto_perfil && usuario.rut) {
      const urlFoto = FotoPerfilService.obtenerUrlFoto(usuario.rut);
      const img = document.createElement('img');
      img.src = urlFoto;
      img.alt = usuario.firstName || usuario.name || 'Usuario';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '50%';
      img.onerror = () => {
        elemento.textContent = this.perfilDataService.obtenerInicialAvatar(usuario);
      };
      elemento.appendChild(img);
    } else {
      elemento.textContent = this.perfilDataService.obtenerInicialAvatar(usuario);
    }
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
    const contenedor = document.querySelector('.contenedor-perfil') || document.body;
    
    let inputFile = document.getElementById('input-file-foto-perfil');
    if (!inputFile) {
      inputFile = document.createElement('input');
      inputFile.id = 'input-file-foto-perfil';
      inputFile.type = 'file';
      inputFile.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
      inputFile.style.display = 'none';
      document.body.appendChild(inputFile);
    }

    if (contenedor._avatarClickHandler) {
      contenedor.removeEventListener('click', contenedor._avatarClickHandler);
    }

    const clickHandler = (event) => {
      const boton = event.target.closest('.boton-cambiar-avatar');
      if (boton) {
        event.preventDefault();
        event.stopPropagation();
        inputFile.click();
      }
    };
    contenedor._avatarClickHandler = clickHandler;
    contenedor.addEventListener('click', clickHandler);

    if (inputFile._changeHandler) {
      inputFile.removeEventListener('change', inputFile._changeHandler);
    }

    const changeHandler = async (event) => {
      const archivo = event.target.files[0];
      if (!archivo) return;

      const botonCambiarAvatar = contenedor.querySelector('.boton-cambiar-avatar');
      const iconoOriginal = botonCambiarAvatar ? botonCambiarAvatar.innerHTML : '';

      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(archivo.type)) {
        toast.error('Tipo de archivo no permitido. Solo se permiten imágenes (jpg, png, gif, webp)');
        inputFile.value = '';
        return;
      }

      const tamañoMaximo = 5 * 1024 * 1024;
      if (archivo.size > tamañoMaximo) {
        toast.error('El archivo es demasiado grande. El tamaño máximo es 5MB');
        inputFile.value = '';
        return;
      }

      const StorageServiceClass = window.StorageService || StorageService;
      const storageService = new StorageServiceClass();
      const usuario = storageService.getItem(PerfilConfig.CLAVES.DATOS_USUARIO);
      
      if (!usuario || !usuario.rut) {
        toast.error('No se pudo obtener la información del usuario');
        inputFile.value = '';
        return;
      }

      try {
        if (botonCambiarAvatar) {
          botonCambiarAvatar.disabled = true;
          botonCambiarAvatar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        const resultado = await FotoPerfilService.subirFoto(usuario.rut, archivo);

        usuario.foto_perfil = resultado.foto_perfil;
        storageService.setItem(PerfilConfig.CLAVES.DATOS_USUARIO, usuario);

        setTimeout(() => {
          if (window.aplicacionPerfilUsuario?.perfilRenderService) {
            window.aplicacionPerfilUsuario.perfilRenderService.actualizarAvatar(usuario);
          }
          if (window.mainMenuApp?.usuarioUIService) {
            window.mainMenuApp.usuarioUIService.mostrarInformacion(usuario);
          }
        }, 100);

        toast.success('Foto de perfil actualizada correctamente');
      } catch (error) {
        console.error('Error al subir foto:', error);
        toast.error(error.message || 'Error al subir la foto de perfil');
      } finally {
        if (botonCambiarAvatar) {
          botonCambiarAvatar.disabled = false;
          botonCambiarAvatar.innerHTML = iconoOriginal;
        }
        inputFile.value = '';
      }
    };
    inputFile._changeHandler = changeHandler;
    inputFile.addEventListener('change', changeHandler);
  }
}

class AplicacionPerfilUsuario {
  constructor() {
    const StorageServiceClass = window.StorageService || StorageService;
    this.storageService = new StorageServiceClass();
    const UsuarioServiceClass = window.UsuarioService || UsuarioService;
    this.usuarioService = new UsuarioServiceClass(
      this.storageService,
      PerfilConfig.CLAVES.DATOS_USUARIO
    );
    this.perfilDataService = new PerfilDataService(this.usuarioService);
    this.perfilRenderService = new PerfilRenderService(this.perfilDataService);
    this.perfilEventService = new PerfilEventService();
    this.datosUsuario = null;
    this.estadisticasWidget = null;
    this.inicializar();
  }

  inicializar() {
    this.cargarDatosUsuario();
    this.configurarEventos();
    this.estadisticasWidget = this.obtenerWidgetEstadisticas();
    this.cargarEstadisticasAcademicas().catch(err => console.warn('[PerfilUsuario] No se pudieron cargar estadísticas:', err));
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

  obtenerWidgetEstadisticas() {
    if (window.historicoEstadisticas) return window.historicoEstadisticas;
    if (window.HistoricoEstadisticas) {
      const widget = new window.HistoricoEstadisticas({ contenedor: '#estadisticasContainer' });
      window.historicoEstadisticas = widget;
      return widget;
    }
    return null;
  }

  async cargarEstadisticasAcademicas() {
    const widget = this.obtenerWidgetEstadisticas();
    if (!widget || !this.datosUsuario) return;

    const carreras = this.datosUsuario.carreras || [];
    const primeraCarrera = carreras.length > 0 ? carreras[0] : null;

    if (primeraCarrera) {
      await widget.cargarDesdeUsuario(this.datosUsuario, primeraCarrera);
    } else {
      widget.actualizar({ aprobados: 0, reprobados: 0, pendientes: 0, totalPeriodos: 0 });
    }
  }

  configurarEventos() {
    this.perfilEventService.configurarBotonVolver();
    this.perfilEventService.configurarBotonesAccion();
  }
}

function inicializarPerfilUsuario() {
  const avatarElement = document.getElementById(PerfilConfig.IDS.AVATAR_GRANDE);
  if (avatarElement && !window.aplicacionPerfilUsuario) {
    window.aplicacionPerfilUsuario = new AplicacionPerfilUsuario();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarPerfilUsuario);
} else {
  inicializarPerfilUsuario();
  setTimeout(inicializarPerfilUsuario, 100);
}

if (typeof window !== 'undefined') {
  window.PerfilConfig = PerfilConfig;
  window.StorageService = StorageService;
  window.UsuarioService = UsuarioService;
  window.FotoPerfilService = FotoPerfilService;
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
    FotoPerfilService,
    PerfilDataService,
    PerfilRenderService,
    PerfilEventService
  };
}
