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

  // ===== BOTONES DE ACCIÓN =====
  configurarBotonesAccion() {
    const botonesAccion = document.querySelectorAll('.action-btn');
    botonesAccion.forEach(boton => {
      boton.addEventListener('click', (e) => {
        const textoBoton = e.currentTarget.querySelector('span').textContent;
        this.manejarAccion(textoBoton);
      });
    });
  }

  manejarAccion(nombreAccion) {
    console.log('Acción seleccionada:', nombreAccion);
    
    // Aquí puedes implementar las acciones específicas
    switch (nombreAccion) {
      case 'Editar Perfil':
        this.mostrarMensaje('Función de edición de perfil próximamente', 'info');
        break;
      case 'Cambiar Contraseña':
        this.mostrarMensaje('Función de cambio de contraseña próximamente', 'info');
        break;
      case 'Notificaciones':
        this.mostrarMensaje('Configuración de notificaciones próximamente', 'info');
        break;
      default:
        console.log('Acción no reconocida');
    }
  }

  // ===== MENSAJES =====
  mostrarMensaje(mensaje, tipo = 'info') {
    // Crear elemento de notificación temporal
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${tipo === 'info' ? '#3b82f6' : '#10b981'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;
    notificacion.textContent = mensaje;

    // Agregar animación
    const estilo = document.createElement('style');
    estilo.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(estilo);

    document.body.appendChild(notificacion);

    // Remover después de 3 segundos
    setTimeout(() => {
      notificacion.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notificacion.remove(), 300);
    }, 3000);
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
