// ===== CONFIGURACIÓN Y CONSTANTES =====
const STORAGE_KEYS = {
  USER_DATA: 'ucn_user_data'
  // Solo sessionStorage para desarrollo
};

// ===== CLASE PERFIL DE USUARIO =====
class UserProfileApp {
  constructor() {
    this.userData = null;
    this.init();
  }

  // Inicialización
  init() {
    this.loadUserData();
    this.setupBackButton();
    this.setupActionButtons();
  }

  // ===== CARGA DE DATOS DEL USUARIO =====
  loadUserData() {
    // Solo sessionStorage
    const userDataStr = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (userDataStr) {
      try {
        this.userData = JSON.parse(userDataStr);
        this.displayUserProfile();
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    } else {
      console.warn('No hay datos de usuario disponibles');
    }
  }

  // ===== VISUALIZACIÓN DEL PERFIL =====
  displayUserProfile() {
    if (!this.userData) return;

    // Avatar grande
    const avatarLarge = document.getElementById('profileAvatarLarge');
    if (avatarLarge && this.userData.firstName) {
      avatarLarge.textContent = this.userData.firstName.charAt(0).toUpperCase();
    }

    // Nombre completo en header
    const fullName = document.getElementById('profileFullName');
    if (fullName) {
      fullName.textContent = this.userData.name || 
                            `${this.userData.firstName || ''} ${this.userData.lastName || ''}`.trim();
    }

    // Rol
    const role = document.getElementById('profileRole');
    if (role && this.userData.role) {
      const roleTranslations = {
        'student': 'Estudiante',
        'admin': 'Administrador',
        'teacher': 'Profesor'
      };
      role.textContent = roleTranslations[this.userData.role] || this.userData.role;
    }

    // Email en header
    const email = document.getElementById('profileEmail');
    if (email && this.userData.email) {
      email.textContent = this.userData.email;
    }

    // Detalles - Nombre completo
    const detailFullName = document.getElementById('detailFullName');
    if (detailFullName) {
      detailFullName.textContent = this.userData.name || 
                                   `${this.userData.firstName || ''} ${this.userData.lastName || ''}`.trim();
    }

    // Detalles - RUT
    const detailRut = document.getElementById('detailRut');
    if (detailRut && this.userData.rut) {
      detailRut.textContent = this.userData.rut;
    }

    // Detalles - Username
    const detailUsername = document.getElementById('detailUsername');
    if (detailUsername && this.userData.username) {
      detailUsername.textContent = this.userData.username;
    }

    // Detalles - Email
    const detailEmail = document.getElementById('detailEmail');
    if (detailEmail && this.userData.email) {
      detailEmail.textContent = this.userData.email;
    }
  }

  // ===== BOTÓN VOLVER =====
  setupBackButton() {
    const backBtn = document.getElementById('backToHome');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Disparar evento personalizado para volver al home
        const event = new CustomEvent('navigateBack');
        window.dispatchEvent(event);
      });
    }
  }

  // ===== BOTONES DE ACCIÓN =====
  setupActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const buttonText = e.currentTarget.querySelector('span').textContent;
        this.handleAction(buttonText);
      });
    });
  }

  handleAction(actionName) {
    console.log('Acción seleccionada:', actionName);
    
    // Aquí puedes implementar las acciones específicas
    switch (actionName) {
      case 'Editar Perfil':
        this.showMessage('Función de edición de perfil próximamente', 'info');
        break;
      case 'Cambiar Contraseña':
        this.showMessage('Función de cambio de contraseña próximamente', 'info');
        break;
      case 'Notificaciones':
        this.showMessage('Configuración de notificaciones próximamente', 'info');
        break;
      default:
        console.log('Acción no reconocida');
    }
  }

  // ===== MENSAJES =====
  showMessage(message, type = 'info') {
    // Crear elemento de notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${type === 'info' ? '#3b82f6' : '#10b981'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;
    notification.textContent = message;

    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// ===== INICIALIZACIÓN =====
// Solo inicializar si estamos en el contexto del perfil cargado dinámicamente
if (document.getElementById('profileAvatarLarge')) {
  window.userProfileApp = new UserProfileApp();
}

// ===== EXPORTAR PARA TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UserProfileApp, STORAGE_KEYS };
}
