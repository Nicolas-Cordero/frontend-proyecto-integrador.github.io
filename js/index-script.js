// ===== CONFIGURACIÓN Y CONSTANTES =====
const CONFIGURACION = {
  URL_BASE_API: 'https://puclaro.ucn.cl/eross/avance',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    VALIDATE: '/auth/validate',
    REFRESH: '/auth/refresh'
  },
  CLAVES_ALMACENAMIENTO: {
    DATOS_USUARIO: 'ucn_user_data'
    // Solo sessionStorage para desarrollo
  },
  VALIDACION: {
    LONGITUD_MINIMA_CONTRASENA: 3,
    MAX_INTENTOS_LOGIN: 3,
    DURACION_BLOQUEO: 300000 // 5 minutos en milisegundos
  }
};

// NOTA: Los datos de MOCK_USERS ahora se cargan desde mockups.js
// Ese archivo debe ser incluido antes de este script en el HTML

// ===== CLASE PRINCIPAL DE LA APLICACIÓN =====
class LoginApp {
  constructor() {
    this.inicializar();
  }

  // Inicialización de la aplicación
  inicializar() {
    this.enlazarEventos();
    this.verificarSesionExistente();
    this.configurarValidacionFormulario();
  }

  // ===== MANEJO DE EVENTOS =====
  enlazarEventos() {
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', this.manejarInicioSesion.bind(this));
    }

    // Toggle de contraseña
    const passwordToggle = document.getElementById('alternarContrasena');
    if (passwordToggle) {
      passwordToggle.addEventListener('click', this.alternarVisibilidadContrasena.bind(this));
    }

    // Validación en tiempo real
    const usernameInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('contrasena');

    if (usernameInput) {
      usernameInput.addEventListener('blur', () => this.validarCampo('usuario'));
      usernameInput.addEventListener('input', this.limpiarErrores.bind(this, 'usuario'));
    }

    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validarCampo('contrasena'));
      passwordInput.addEventListener('input', this.limpiarErrores.bind(this, 'contrasena'));
    }

    // Botones de login alternativo
    const googleLoginBtn = document.querySelector('.google-login');

    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', () => this.manejarInicioSesionAlternativo('google'));
    }

    // Enlaces
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', this.manejarOlvidoContrasena.bind(this));
    }

    // Menú móvil
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', this.alternarMenuMovil.bind(this));
    }

    // Tecla Enter en campos
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && (e.target.id === 'usuario' || e.target.id === 'contrasena')) {
        this.manejarInicioSesion(e);
      }
    });
  }

  // ===== VALIDACIÓN DE FORMULARIO =====
  configurarValidacionFormulario() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Configurar validación HTML5 personalizada
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('invalid', this.manejarEntradaInvalida.bind(this));
    });
  }

  validarCampo(fieldName) {
    const input = document.getElementById(fieldName);
    const errorElementId = fieldName === 'usuario' ? 'errorUsuario' : fieldName === 'contrasena' ? 'errorContrasena' : `${fieldName}Error`;
    const errorElement = document.getElementById(errorElementId);
    
    if (!input || !errorElement) return false;

    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'usuario':
        isValid = this.validarNombreUsuario(input.value);
        errorMessage = isValid ? '' : 'Ingresa un usuario o email válido';
        break;
      case 'contrasena':
        isValid = this.validarContrasena(input.value);
        errorMessage = isValid ? '' : `La contraseña debe tener al menos ${CONFIGURACION.VALIDACION.LONGITUD_MINIMA_CONTRASENA} caracteres`;
        break;
    }

    this.mostrarErrorCampo(errorElementId, errorMessage);
    this.actualizarEstilosCampo(input, isValid);

    return isValid;
  }

  validarNombreUsuario(username) {
    if (!username || username.trim().length === 0) return false;
    
    // Validar email si contiene @
    if (username.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(username);
    }
    
    // Validar usuario (mínimo 3 caracteres, solo letras, números y guiones)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
    return usernameRegex.test(username);
  }

  validarContrasena(password) {
    return password && password.length >= CONFIGURACION.VALIDACION.LONGITUD_MINIMA_CONTRASENA;
  }

  // ===== MANEJO DE ERRORES VISUALES =====
  mostrarErrorCampo(errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    if (!errorElement) return;

    if (message) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    } else {
      errorElement.classList.remove('show');
    }
  }

  limpiarErrores(fieldName) {
    const errorElementId = fieldName === 'usuario' ? 'errorUsuario' : fieldName === 'contrasena' ? 'errorContrasena' : `${fieldName}Error`;
  this.mostrarErrorCampo(errorElementId, '');
    const input = document.getElementById(fieldName);
    if (input) {
      this.actualizarEstilosCampo(input, true);
    }
  }

  actualizarEstilosCampo(input, isValid) {
    if (isValid) {
      input.classList.remove('invalid');
      input.classList.add('valid');
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
    }
  }

  manejarEntradaInvalida(event) {
    event.preventDefault();
    const input = event.target;
    const fieldName = input.name || input.id;
    
    let message = '';
    if (input.validity.valueMissing) {
      message = `El campo ${fieldName === 'usuario' ? 'usuario' : 'contraseña'} es requerido`;
    } else if (input.validity.typeMismatch) {
      message = 'Formato no válido';
    }
    
    const errorElementId = fieldName === 'usuario' ? 'errorUsuario' : fieldName === 'contrasena' ? 'errorContrasena' : `${fieldName}Error`;
    this.showFieldError(errorElementId, message);
  }

  // ===== FUNCIONALIDAD DE LOGIN =====
  async manejarInicioSesion(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const loginData = {
      username: formData.get('usuario')?.trim(),
      password: formData.get('contrasena')
    };

    // Validar campos
  const isUsernameValid = this.validarCampo('usuario');
  const isPasswordValid = this.validarCampo('contrasena');

    if (!isUsernameValid || !isPasswordValid) {
      this.mostrarMensajeEstado('error', 'Por favor corrige los errores antes de continuar');
      return;
    }

    try {
      this.mostrarCarga(true);
      
      const result = await this.realizarInicioSesion(loginData);
      
      if (result.success) {
        this.manejarInicioSesionExitoso(result.data);
      } else {
        this.manejarErrorInicioSesion(result.error);
      }
    } catch (error) {
      this.manejarErrorInicioSesion('Error al procesar la solicitud');
    } finally {
      this.mostrarCarga(false);
    }
  }

  async realizarInicioSesion(loginData) {
    // Intentar login usando el endpoint público provisto (puclaro)
    try {
      const email = loginData.username;
      const password = loginData.password;
      const loginUrl = `https://puclaro.ucn.cl/eross/avance/login.php?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const resp = await fetch(loginUrl, { method: 'GET', redirect: 'follow' });
      const text = await resp.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        throw new Error(`Respuesta inválida del servidor: ${text}`);
      }

      if (parsed && parsed.error) {
        return { success: false, error: parsed.error };
      }

      const carreras = Array.isArray(parsed.carreras) ? parsed.carreras : [];
      const userObj = {
        id: parsed.rut || null,
        username: email.split('@')[0],
        email: email,
        name: email.split('@')[0],
        firstName: email.split('@')[0].split('.')[0] || email.split('@')[0],
        lastName: '',
        rut: parsed.rut || null,
        role: 'student',
        profilePicture: null,
        carreras: carreras,
        academicInfo: {
          career: carreras[0] ? carreras[0].nombre : undefined,
          catalog: carreras[0] ? carreras[0].catalogo : undefined
        }
      };

      return { success: true, data: { user: userObj } };
    } catch (error) {
      console.error('Error al conectar con el endpoint de login:', error);
      return {
        success: false,
        error: 'No fue posible conectar con el servicio de autenticación. Intenta nuevamente más tarde.'
      };
    }
  }

  manejarInicioSesionExitoso(data) {
    console.log('✅ Login exitoso, datos del usuario:', data.user);
    console.log('📊 academicInfo recibido:', data.user.academicInfo);
    
    // Guardar SOLO en sessionStorage
  this.guardarDatosSesion(data);

    // Mostrar mensaje de éxito
  this.mostrarMensajeEstado('success', '¡Inicio de sesión exitoso! Redirigiendo...');

    // Redirigir al menú principal después de 1.5 segundos
    setTimeout(() => {
      window.location.href = 'main-menu.html';
    }, 1500);
  }

  manejarErrorInicioSesion(errorMessage) {
    this.mostrarMensajeEstado('error', errorMessage);

    // Limpiar contraseña
    const passwordInput = document.getElementById('contrasena');
    if (passwordInput) {
      passwordInput.value = '';
    }
  }

  // ===== GESTIÓN DE SESIÓN =====
  guardarDatosSesion(data) {
    // SOLO sessionStorage para desarrollo
    if (data.user) {
      sessionStorage.setItem(CONFIGURACION.CLAVES_ALMACENAMIENTO.DATOS_USUARIO, JSON.stringify(data.user));
      console.log('✅ Usuario guardado en sessionStorage:', data.user);
    }
  }

  verificarSesionExistente() {
    const userData = sessionStorage.getItem(CONFIGURACION.CLAVES_ALMACENAMIENTO.DATOS_USUARIO);
    
    if (userData) {
      console.log('Sesión existente encontrada');
      // Opcional: redirigir automáticamente
      // window.location.href = 'main-menu.html';
    }
  }

  limpiarDatosSesion() {
    sessionStorage.clear();
    console.log('✅ SessionStorage limpiado');
  }

  // ===== FUNCIONALIDADES ADICIONALES =====
  alternarVisibilidadContrasena() {
    const passwordInput = document.getElementById('contrasena');
    const toggleBtn = document.getElementById('alternarContrasena');
    
    if (!passwordInput || !toggleBtn) return;

    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
  }

  manejarInicioSesionAlternativo(provider) {
    this.mostrarMensajeEstado('warning', `Login con ${provider} no está disponible temporalmente`);
  }

  manejarOlvidoContrasena(event) {
    event.preventDefault();
    this.mostrarMensajeEstado('info', 'Contacta al administrador para recuperar tu contraseña: soporte@ucn.cl');
  }

  alternarMenuMovil() {
    // Implementar funcionalidad de menú móvil si es necesario
    console.log('Toggle mobile menu');
  }

  // ===== UI HELPERS =====
  mostrarCarga(show) {
    const loginBtn = document.getElementById('botonLogin');
    const loadingOverlay = document.getElementById('superposicionCarga');
    
    if (loginBtn) {
      const btnText = loginBtn.querySelector('.texto-boton');
      const btnLoading = loginBtn.querySelector('.carga-boton');
      
      if (show) {
        loginBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
      } else {
        loginBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
      }
    }

    if (loadingOverlay) {
      loadingOverlay.style.display = show ? 'flex' : 'none';
    }
  }

  mostrarMensajeEstado(type, message) {
    const statusElement = document.getElementById('mensajeEstado');
    if (!statusElement) return;

    const statusIcon = statusElement.querySelector('.status-icon');
    const statusText = statusElement.querySelector('.status-text');

    // Limpiar clases previas
    statusElement.className = 'status-message';
    statusElement.classList.add(type);

    // Configurar icono según el tipo
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
      case 'info':
        iconClass = 'fas fa-info-circle';
        break;
    }

    if (statusIcon) {
      statusIcon.className = `status-icon ${iconClass}`;
    }
    
    if (statusText) {
      statusText.textContent = message;
    }

    statusElement.style.display = 'block';

    // Auto ocultar después de 5 segundos para mensajes no críticos
    if (type !== 'error') {
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 5000);
    }
  }
}

// ===== UTILIDADES ADICIONALES =====
class Utils {
  static formatearFecha(date) {
    return new Intl.DateTimeFormat('es-CL').format(date);
  }

  static formatearHora(date) {
    return new Intl.DateTimeFormat('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar aplicación principal
  window.loginApp = new LoginApp();

  // Configurar PWA si es soportado
  if ('serviceWorker' in navigator) {
    console.log('Service Worker support detected');
    // Implementar service worker para funcionalidad offline
  }

  // Configurar eventos globales
  window.addEventListener('online', () => {
    console.log('Conexión restaurada');
  });

  window.addEventListener('offline', () => {
    console.log('Conexión perdida');
  });

  // Log de información del sistema
  console.log('Sistema de login UCN inicializado');
  console.log('Versión: 1.0.1');
  console.log('Entorno:', window.location.hostname === 'localhost' ? 'desarrollo' : 'producción');
});

// ===== EXPORTAR PARA TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LoginApp, Utils, CONFIGURACION };
}
