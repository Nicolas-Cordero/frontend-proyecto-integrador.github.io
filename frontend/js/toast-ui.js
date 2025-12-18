// ===== SISTEMA TOAST UI =====
// Notificaciones tipo Toast que aparecen en la esquina superior derecha

if (typeof ToastUI === 'undefined') {
class ToastUI {
  constructor() {
    this.container = null;
    this.inicializar();
  }

  inicializar() {
    // Crear contenedor de toasts si no existe
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }

    // Agregar estilos de animación
    if (!document.getElementById('toast-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'toast-styles';
      styleSheet.textContent = `
        .toast {
          pointer-events: auto;
          padding: 14px 18px;
          border-radius: 6px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          min-width: 280px;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 4.7s forwards;
          background-color: #fff;
          color: #333;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }

        /* Toast Success */
        .toast.success {
          background-color: #ecfdf5;
          border-left: 4px solid #10b981;
          color: #059669;
        }

        .toast.success .toast-icon {
          color: #10b981;
        }

        /* Toast Error */
        .toast.error {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          color: #dc2626;
        }

        .toast.error .toast-icon {
          color: #ef4444;
        }

        /* Toast Warning */
        .toast.warning {
          background-color: #fffbeb;
          border-left: 4px solid #f59e0b;
          color: #d97706;
        }

        .toast.warning .toast-icon {
          color: #f59e0b;
        }

        /* Toast Info */
        .toast.info {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
          color: #1e40af;
        }

        .toast.info .toast-icon {
          color: #3b82f6;
        }

        /* Toast Loading */
        .toast.loading {
          background-color: #f0f9ff;
          border-left: 4px solid #06b6d4;
          color: #0e7490;
        }

        .toast.loading .toast-icon {
          color: #06b6d4;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .toast-icon {
          font-size: 18px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .toast-content {
          flex: 1;
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          opacity: 0.6;
          transition: opacity 0.2s;
          flex-shrink: 0;
          font-size: 16px;
        }

        .toast-close:hover {
          opacity: 1;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .toast {
            min-width: auto;
            max-width: calc(100vw - 40px);
          }

          #toast-container {
            right: 10px;
            left: 10px;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }

  /**
   * Mostrar un toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info', 'loading'
   * @param {number} duration - Duración en ms (0 = permanente)
   * @returns {string} ID del toast para referencia
   */
  show(message, type = 'info', duration = 4700) {
    const toastId = `toast-${Date.now()}-${Math.random()}`;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;

    // Configurar icono según tipo
    let iconClass = '';
    switch (type) {
      case 'success':
        iconClass = 'fas fa-check-circle';
        break;
      case 'error':
        iconClass = 'fas fa-exclamation-circle';
        break;
      case 'warning':
        iconClass = 'fas fa-exclamation-triangle';
        break;
      case 'loading':
        iconClass = 'fas fa-spinner';
        break;
      case 'info':
      default:
        iconClass = 'fas fa-info-circle';
        break;
    }

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${iconClass}"></i>
      </div>
      <div class="toast-content">${message}</div>
      <button class="toast-close" aria-label="Cerrar notificación">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Evento para cerrar manual
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toastId));

    // Agregar al contenedor
    this.container.appendChild(toast);

    // Remover automáticamente después de duration (si no es permanente)
    if (duration > 0) {
      setTimeout(() => this.remove(toastId), duration);
    }

    return toastId;
  }

  /**
   * Mostrar toast de éxito
   */
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  /**
   * Mostrar toast de error
   */
  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  /**
   * Mostrar toast de advertencia
   */
  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  /**
   * Mostrar toast de información
   */
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  /**
   * Mostrar toast de carga (sin auto-close)
   */
  loading(message) {
    return this.show(message, 'loading', 0);
  }

  /**
   * Remover un toast específico
   */
  remove(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      // Forzar animación de salida
      toast.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }

  /**
   * Limpiar todos los toasts
   */
  clearAll() {
    const toasts = this.container.querySelectorAll('.toast');
    toasts.forEach(toast => {
      this.remove(toast.id);
    });
  }

  /**
   * Actualizar el mensaje de un toast existente
   */
  update(toastId, message) {
    const toast = document.getElementById(toastId);
    if (toast) {
      const content = toast.querySelector('.toast-content');
      if (content) {
        content.textContent = message;
      }
    }
  }
}

window.ToastUI = ToastUI;
}

// Inicializar globalmente solo si no existe
if (typeof window.toast === 'undefined') {
  window.toast = new ToastUI();
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastUI };
}
