// ===== CONFIGURACIÓN Y CONSTANTES =====
const CONFIG = {
  API_BASE_URL: 'https://puclaro.ucn.cl/eross/avance',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    VALIDATE: '/auth/validate',
    REFRESH: '/auth/refresh'
  },
  STORAGE_KEYS: {
    TOKEN: 'ucn_auth_token',
    REFRESH_TOKEN: 'ucn_refresh_token',
    USER_DATA: 'ucn_user_data',
    REMEMBER_ME: 'ucn_remember_me'
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_LOGIN_ATTEMPTS: 3,
    LOCKOUT_DURATION: 300000 // 5 minutos en milisegundos
  }
};

// ===== CLASE PRINCIPAL DE LA APLICACIÓN =====
class LoginApp {
  constructor() {
    this.loginAttempts = 0;
    this.isLocked = false;
    this.lockoutTimer = null;
    
    this.init();
  }

  // Inicialización de la aplicación
  init() {
    this.bindEvents();
    this.checkExistingSession();
    this.setupFormValidation();
    this.checkLockoutStatus();
  }

  // ===== MANEJO DE EVENTOS =====
  bindEvents() {
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    // Toggle de contraseña
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
      passwordToggle.addEventListener('click', this.togglePasswordVisibility.bind(this));
    }

    // Validación en tiempo real
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (usernameInput) {
      usernameInput.addEventListener('blur', () => this.validateField('username'));
      usernameInput.addEventListener('input', this.clearErrors.bind(this, 'username'));
    }

    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validateField('password'));
      passwordInput.addEventListener('input', this.clearErrors.bind(this, 'password'));
    }

    // Botones de login alternativo
    const googleLoginBtn = document.querySelector('.google-login');

    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', () => this.handleAlternativeLogin('google'));
    }

    // Enlaces
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', this.handleForgotPassword.bind(this));
    }

    // Menú móvil
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
    }

    // Tecla Enter en campos
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && (e.target.id === 'username' || e.target.id === 'password')) {
        this.handleLogin(e);
      }
    });
  }

  // ===== VALIDACIÓN DE FORMULARIO =====
  setupFormValidation() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Configurar validación HTML5 personalizada
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('invalid', this.handleInvalidInput.bind(this));
    });
  }

  validateField(fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}Error`);
    
    if (!input || !errorElement) return false;

    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'username':
        isValid = this.validateUsername(input.value);
        errorMessage = isValid ? '' : 'Ingresa un usuario o email válido';
        break;
      case 'password':
        isValid = this.validatePassword(input.value);
        errorMessage = isValid ? '' : `La contraseña debe tener al menos ${CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caracteres`;
        break;
    }

    this.showFieldError(fieldName, errorMessage);
    this.updateFieldStyles(input, isValid);

    return isValid;
  }

  validateUsername(username) {
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

  validatePassword(password) {
    return password && password.length >= CONFIG.VALIDATION.MIN_PASSWORD_LENGTH;
  }

  // ===== MANEJO DE ERRORES VISUALES =====
  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    if (!errorElement) return;

    if (message) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    } else {
      errorElement.classList.remove('show');
    }
  }

  clearErrors(fieldName) {
    this.showFieldError(fieldName, '');
    const input = document.getElementById(fieldName);
    if (input) {
      this.updateFieldStyles(input, true);
    }
  }

  updateFieldStyles(input, isValid) {
    if (isValid) {
      input.classList.remove('invalid');
      input.classList.add('valid');
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
    }
  }

  handleInvalidInput(event) {
    event.preventDefault();
    const input = event.target;
    const fieldName = input.name || input.id;
    
    let message = '';
    if (input.validity.valueMissing) {
      message = `El campo ${fieldName === 'username' ? 'usuario' : 'contraseña'} es requerido`;
    } else if (input.validity.typeMismatch) {
      message = 'Formato no válido';
    }
    
    this.showFieldError(fieldName, message);
  }

  // ===== FUNCIONALIDAD DE LOGIN =====
  async handleLogin(event) {
    event.preventDefault();

    // Verificar si está bloqueado
    if (this.isLocked) {
      this.showStatusMessage('error', 'Demasiados intentos fallidos. Intenta nuevamente más tarde.');
      return;
    }

    const formData = new FormData(event.target);
    const loginData = {
      username: formData.get('username')?.trim(),
      password: formData.get('password'),
      rememberMe: formData.get('rememberMe') === 'on'
    };

    // Validar campos
    const isUsernameValid = this.validateField('username');
    const isPasswordValid = this.validateField('password');

    if (!isUsernameValid || !isPasswordValid) {
      this.showStatusMessage('error', 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      this.showLoading(true);
      const result = await this.performLogin(loginData);
      
      if (result.success) {
        this.handleLoginSuccess(result.data, loginData.rememberMe);
      } else {
        this.handleLoginError(result.error);
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      this.handleLoginError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      this.showLoading(false);
    }
  }

  async performLogin(loginData) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { 
          success: false, 
          error: data.message || 'Credenciales incorrectas' 
        };
      }
    } catch (error) {
      // Simulación temporal para desarrollo
      console.warn('API no disponible, usando modo de desarrollo');
      
      // Simular respuesta exitosa para pruebas
      if (loginData.username === 'demo' && loginData.password === 'demo123') {
        return {
          success: true,
          data: {
            token: 'demo_token_123',
            refreshToken: 'demo_refresh_456',
            user: {
              id: 1,
              username: loginData.username,
              email: 'demo@ucn.cl',
              name: 'Usuario Demo',
              role: 'student'
            }
          }
        };
      } else {
        return {
          success: false,
          error: 'Credenciales incorrectas'
        };
      }
    }
  }

  handleLoginSuccess(data, rememberMe) {
    // Resetear intentos de login
    this.loginAttempts = 0;
    this.clearLockout();

    // Guardar datos de sesión
    this.saveSessionData(data, rememberMe);

    // Mostrar mensaje de éxito
    this.showStatusMessage('success', '¡Inicio de sesión exitoso! Redirigiendo...');

    // Simular redirección (en producción, redireccionar a dashboard)
    setTimeout(() => {
      console.log('Redirigiendo al dashboard...');
      // window.location.href = '/dashboard';
    }, 1500);
  }

  handleLoginError(errorMessage) {
    this.loginAttempts++;
    
    if (this.loginAttempts >= CONFIG.VALIDATION.MAX_LOGIN_ATTEMPTS) {
      this.lockAccount();
      this.showStatusMessage('error', 'Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
    } else {
      const remainingAttempts = CONFIG.VALIDATION.MAX_LOGIN_ATTEMPTS - this.loginAttempts;
      this.showStatusMessage('error', `${errorMessage}. Intentos restantes: ${remainingAttempts}`);
    }

    // Limpiar contraseña
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.value = '';
    }
  }

  // ===== GESTIÓN DE SESIÓN =====
  saveSessionData(data, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
    if (data.refreshToken) {
      storage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    if (data.user) {
      storage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
    }
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
  }

  checkExistingSession() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || 
                  sessionStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    
    if (token) {
      // Verificar si el token es válido
      this.validateToken(token);
    }
  }

  async validateToken(token) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.VALIDATE}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Sesión válida encontrada');
        // Redirigir al dashboard si hay sesión válida
        // window.location.href = '/dashboard';
      }
    } catch (error) {
      console.log('No hay sesión válida o error al validar');
      this.clearSessionData();
    }
  }

  clearSessionData() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
  }

  // ===== BLOQUEO DE CUENTA =====
  lockAccount() {
    this.isLocked = true;
    const lockoutEndTime = Date.now() + CONFIG.VALIDATION.LOCKOUT_DURATION;
    localStorage.setItem('lockout_end', lockoutEndTime.toString());
    
    this.startLockoutTimer(CONFIG.VALIDATION.LOCKOUT_DURATION);
  }

  checkLockoutStatus() {
    const lockoutEnd = localStorage.getItem('lockout_end');
    if (lockoutEnd) {
      const endTime = parseInt(lockoutEnd);
      const now = Date.now();
      
      if (now < endTime) {
        this.isLocked = true;
        this.startLockoutTimer(endTime - now);
      } else {
        this.clearLockout();
      }
    }
  }

  startLockoutTimer(duration) {
    this.lockoutTimer = setTimeout(() => {
      this.clearLockout();
    }, duration);
  }

  clearLockout() {
    this.isLocked = false;
    this.loginAttempts = 0;
    localStorage.removeItem('lockout_end');
    
    if (this.lockoutTimer) {
      clearTimeout(this.lockoutTimer);
      this.lockoutTimer = null;
    }
  }

  // ===== FUNCIONALIDADES ADICIONALES =====
  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('passwordToggle');
    
    if (!passwordInput || !toggleBtn) return;

    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
  }

  handleAlternativeLogin(provider) {
    this.showStatusMessage('warning', `Login con ${provider} no está disponible temporalmente`);
  }

  handleForgotPassword(event) {
    event.preventDefault();
    this.showStatusMessage('info', 'Contacta al administrador para recuperar tu contraseña: soporte@ucn.cl');
  }

  toggleMobileMenu() {
    // Implementar funcionalidad de menú móvil si es necesario
    console.log('Toggle mobile menu');
  }

  // ===== UI HELPERS =====
  showLoading(show) {
    const loginBtn = document.getElementById('loginBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (loginBtn) {
      const btnText = loginBtn.querySelector('.btn-text');
      const btnLoading = loginBtn.querySelector('.btn-loading');
      
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

  showStatusMessage(type, message) {
    const statusElement = document.getElementById('statusMessage');
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
  static formatDate(date) {
    return new Intl.DateTimeFormat('es-CL').format(date);
  }

  static formatTime(date) {
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
  module.exports = { LoginApp, Utils, CONFIG };
}
