// ===== CONFIGURACIÓN Y CONSTANTES =====
const CLAVES_ALMACENAMIENTO = {
  DATOS_USUARIO: 'ucn_user_data'
  // Solo sessionStorage para desarrollo
};

// ===== CLASE PERFIL DE USUARIO =====
class AplicacionPerfilUsuario {
  constructor() {
    this.datosUsuario = null;
    this.inicializar();
  }

  // Inicialización
  inicializar() {
    this.cargarDatosUsuario();
    this.configurarBotonVolver();
    this.configurarBotonesAccion();
  }

  // ===== CARGA DE DATOS DEL USUARIO =====
  cargarDatosUsuario() {
    // Solo sessionStorage
    const cadenaDatosUsuario = sessionStorage.getItem(CLAVES_ALMACENAMIENTO.DATOS_USUARIO);
    
    if (cadenaDatosUsuario) {
      try {
  this.datosUsuario = JSON.parse(cadenaDatosUsuario);
  this.mostrarPerfilUsuario();
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    } else {
      console.warn('No hay datos de usuario disponibles');
    }
  }

    // ===== VISUALIZACIÓN DEL PERFIL =====
  mostrarPerfilUsuario() {
    if (!this.datosUsuario) return;

    // Avatar grande
    const avatarGrande = document.getElementById('avatarPerfilGrande');
    if (avatarGrande && this.datosUsuario.firstName) {
      avatarGrande.textContent = this.datosUsuario.firstName.charAt(0).toUpperCase();
    }

    // Nombre completo en header
    const nombreCompleto = document.getElementById('nombreCompletoPerfil');
    if (nombreCompleto) {
      nombreCompleto.textContent = this.datosUsuario.name || 
                            `${this.datosUsuario.firstName || ''} ${this.datosUsuario.lastName || ''}`.trim();
    }

    // Rol
    const rol = document.getElementById('rolPerfil');
    if (rol && this.datosUsuario.role) {
      const traduccionesRol = {
        'student': 'Estudiante',
        'admin': 'Administrador',
        'teacher': 'Profesor'
      };
      rol.textContent = traduccionesRol[this.datosUsuario.role] || this.datosUsuario.role;
    }

    // Email en header
    const correo = document.getElementById('correoPerfil');
    if (correo && this.datosUsuario.email) {
      correo.textContent = this.datosUsuario.email;
    }

    // Detalles - Nombre completo
    const detalleNombreCompleto = document.getElementById('nombreCompletoDetalle');
    if (detalleNombreCompleto) {
      detalleNombreCompleto.textContent = this.datosUsuario.name || 
                                   `${this.datosUsuario.firstName || ''} ${this.datosUsuario.lastName || ''}`.trim();
    }

    // Detalles - RUT
    const detalleRut = document.getElementById('rutDetalle');
    if (detalleRut && this.datosUsuario.rut) {
      detalleRut.textContent = this.datosUsuario.rut;
    }

    // Detalles - Username
    const detalleNombreUsuario = document.getElementById('nombreUsuarioDetalle');
    if (detalleNombreUsuario && this.datosUsuario.username) {
      detalleNombreUsuario.textContent = this.datosUsuario.username;
    }

    // Detalles - Email
    const detalleCorreo = document.getElementById('correoDetalle');
    if (detalleCorreo && this.datosUsuario.email) {
      detalleCorreo.textContent = this.datosUsuario.email;
    }
  }

  // ===== BOTÓN VOLVER =====
  configurarBotonVolver() {
    const botonVolver = document.getElementById('volverInicio');
    if (botonVolver) {
      botonVolver.addEventListener('click', () => {
        // Disparar evento personalizado para volver al home
        const evento = new CustomEvent('navigateBack');
        window.dispatchEvent(evento);
      });
    }
  }

  
}

// ===== INICIALIZACIÓN =====
// Solo inicializar si estamos en el contexto del perfil cargado dinámicamente
if (document.getElementById('avatarPerfilGrande')) {
  window.aplicacionPerfilUsuario = new AplicacionPerfilUsuario();
}

// ===== EXPORTAR PARA TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AplicacionPerfilUsuario, CLAVES_ALMACENAMIENTO };
}
