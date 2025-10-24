// ===== CONFIGURACIÓN Y CONSTANTES =====
const STORAGE_KEYS = {
  USER_DATA: 'ucn_user_data'
  // Solo sessionStorage para desarrollo
};

// ===== CLASE PRINCIPAL DEL MENÚ =====
class MainMenuApp {
  constructor() {
    this.contentArea = null;
    this.homeContent = null;
    this.init();
  }

  // Inicialización de la aplicación
  init() {
    this.contentArea = document.querySelector('.content-area');
    if (this.contentArea) {
      // Guardar el contenido original del home
      this.homeContent = this.contentArea.innerHTML;
    }
    
    this.loadUserData();
    this.setupLogout();
    this.setupSearch();
    this.setupProfileNavigation();
    this.setupMallaActualNavigation();
    this.setupBackNavigation();
  }

    // ===== CARGA DE DATOS DEL USUARIO =====
  loadUserData() {
    // Solo sessionStorage
    const userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('📥 Usuario cargado desde sessionStorage:', user);
        this.displayUserInfo(user);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    } else {
      console.warn('No hay datos de usuario disponibles');
      this.redirectToLogin();
    }
  }

    // ===== VISUALIZACIÓN DE INFORMACIÓN DEL USUARIO =====
  displayUserInfo(user) {
    // Actualizar nombre de usuario
    const userNameElement = document.getElementById('userName');
    if (userNameElement && user.name) {
      userNameElement.textContent = user.name;
    }
    
    // Actualizar avatar con imagen o inicial
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
      if (user.profilePicture) {
        // Construir ruta relativa desde html/main-menu.html
        const imagePath = `../${user.profilePicture}`;
        avatarElement.innerHTML = `<img src="${imagePath}" alt="${user.firstName}">`;
      } else if (user.firstName) {
        avatarElement.textContent = user.firstName.charAt(0).toUpperCase();
      }
    }
    
    // Actualizar email en el contenido
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement && user.email) {
      userEmailElement.textContent = user.email;
    }
  }

  // ===== GESTIÓN DE LOGOUT =====
  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.performLogout();
      });
    }
  }

  performLogout() {
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    console.log('✅ Sesión cerrada exitosamente');
    
    // Redirigir al login
    this.redirectToLogin();
  }

  redirectToLogin() {
    window.location.href = 'index.html';
  }

  // ===== FUNCIONALIDAD DE BÚSQUEDA =====
  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
  }

  handleSearch(searchValue) {
    const searchTerm = searchValue.toLowerCase().trim();
    
    // Obtener todos los elementos del menú
    const menuSections = document.querySelectorAll('.menu-section');
    const bottomItems = document.querySelectorAll('.bottom-item');
    
    // Si no hay término de búsqueda, mostrar todo
    if (searchTerm === '') {
      this.showAllMenuItems(menuSections, bottomItems);
      return;
    }
    
    // Filtrar elementos del menú principal
    this.filterMenuSections(menuSections, searchTerm);
    
    // Filtrar elementos del footer (excepto logout)
    this.filterBottomItems(bottomItems, searchTerm);
  }

  showAllMenuItems(menuSections, bottomItems) {
    menuSections.forEach(section => {
      section.style.display = '';
      const menuItems = section.querySelectorAll('.menu-item');
      menuItems.forEach(item => item.style.display = '');
    });
    
    bottomItems.forEach(item => {
      if (!item.classList.contains('logout')) {
        item.style.display = '';
      }
    });
  }

  filterMenuSections(menuSections, searchTerm) {
    menuSections.forEach(section => {
      const menuItems = section.querySelectorAll('.menu-item');
      let visibleItemsCount = 0;
      
      menuItems.forEach(item => {
        const text = item.querySelector('span').textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          item.style.display = '';
          visibleItemsCount++;
        } else {
          item.style.display = 'none';
        }
      });
      
      // Ocultar sección completa si no tiene elementos visibles
      if (visibleItemsCount === 0) {
        section.style.display = 'none';
      } else {
        section.style.display = '';
      }
    });
  }

  filterBottomItems(bottomItems, searchTerm) {
    bottomItems.forEach(item => {
      if (!item.classList.contains('logout')) {
        const text = item.querySelector('span').textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      }
    });
  }

  // ===== NAVEGACIÓN AL PERFIL =====
  setupProfileNavigation() {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) {
      userName.addEventListener('click', () => {
        this.loadProfile();
        this.setActiveMenuItem('profile');
      });
    }
    
    if (userAvatar) {
      userAvatar.style.cursor = 'pointer';
      userAvatar.title = 'Ver perfil';
      userAvatar.addEventListener('click', () => {
        this.loadProfile();
        this.setActiveMenuItem('profile');
      });
    }
  }

  // ===== NAVEGACIÓN A MALLA ACTUAL =====
  setupMallaActualNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
      const itemText = item.querySelector('span')?.textContent;
      if (itemText === 'Malla Actual') {
        item.addEventListener('click', () => {
          this.loadMallaActual();
          this.setActiveMenuItem('malla-actual');
        });
      }
    });
  }

  async loadProfile() {
    if (!this.contentArea) return;

    try {
      // Obtener datos del usuario (SOLO sessionStorage)
      const userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (!userData) {
        throw new Error('No hay datos de usuario disponibles');
      }

      const user = JSON.parse(userData);
      console.log('📄 Cargando perfil para usuario:', user);

      // Generar HTML del perfil directamente
      const profileHTML = this.generateProfileHTML(user);
      this.contentArea.innerHTML = profileHTML;

      // Configurar botón de volver
      const backBtn = document.getElementById('backToHome');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          const event = new CustomEvent('navigateBack');
          window.dispatchEvent(event);
        });
      }

      console.log('✅ Perfil cargado exitosamente');

    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      this.contentArea.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
          <h2 style="color: #1e293b; margin-bottom: 1rem;">Error al cargar el perfil</h2>
          <p style="color: #64748b; margin-bottom: 2rem;">No se pudo cargar la información del perfil.</p>
          <button onclick="window.mainMenuApp.loadHome()" style="padding: 0.75rem 2rem; background: #667eea; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
            Volver al inicio
          </button>
        </div>
      `;
    }
  }

  // ===== NAVEGACIÓN A MALLA ACTUAL =====
  loadMallaActual() {
    if (!this.contentArea) return;

    console.log('📊 Cargando Malla Actual...');

    // HTML embebido directamente (sin fetch)
    const mallaHTML = `
      <div class="malla-actual-container">
        <div class="malla-header">
          <button class="back-btn" id="backToHome">
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </button>
          <div>
            <h1>Malla Curricular Actual</h1>
            <p>Visualiza tu progreso académico y planifica tus próximos semestres</p>
          </div>
        </div>

        <div class="malla-content">
          <p style="text-align: center; color: #64748b; margin-top: 2rem;">
            Contenido en desarrollo...
          </p>
        </div>
      </div>
    `;

    this.contentArea.innerHTML = mallaHTML;

    // Cargar el script de malla-actual
    const existingScript = document.getElementById('malla-actual-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'malla-actual-script';
    script.src = '../js/malla-actual.js?v=' + Date.now();
    document.body.appendChild(script);

    console.log('✅ Malla Actual cargada exitosamente');
  }

  generateProfileHTML(user) {
    // 🔍 DEBUG: Ver qué datos llegan
    console.log('🔍 DEBUG - Datos del usuario:', user);
    console.log('🔍 DEBUG - academicInfo:', user.academicInfo);
    
    const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const firstName = user.firstName || 'Usuario';
    const avatar = firstName.charAt(0).toUpperCase();
    const role = user.role === 'student' ? 'Estudiante' : user.role === 'admin' ? 'Administrador' : 'Usuario';
    const email = user.email || 'No disponible';
    const username = user.username || 'No disponible';
    const rut = user.rut || 'No disponible';
    
    // ✅ Imagen de perfil o fallback a inicial
    const profilePicture = user.profilePicture;
    // Construir ruta relativa desde html/main-menu.html (o donde se cargue el perfil)
    const imagePath = profilePicture ? `../${profilePicture}` : null;
    const avatarContent = imagePath 
      ? `<img src="${imagePath}" alt="${firstName}">` 
      : avatar;
    
    // Datos académicos (con valores por defecto si no existen)
    const academicInfo = user.academicInfo || {};
    const career = academicInfo.career || 'No especificada';
    const generation = academicInfo.generation || 'No especificada';
    const currentSemester = academicInfo.currentSemester || 0;
    const totalSemesters = academicInfo.totalSemesters || 10;
    const gpa = academicInfo.gpa || 0;
    const approvedCourses = academicInfo.approvedCourses || 0;
    const currentCourses = academicInfo.currentCourses || 0;
    
    // ✅ Cálculo DINÁMICO del avance curricular basado en semestres
    const curriculumProgress = totalSemesters > 0 
      ? Math.round((currentSemester / totalSemesters) * 100) 
      : 0;
    
    // Cálculo dinámico de semestres restantes
    const remainingSemesters = Math.max(0, totalSemesters - currentSemester);
    
    // 🔍 DEBUG: Ver valores calculados
    console.log('🔍 DEBUG - Valores calculados:', {
      career,
      generation,
      currentSemester,
      gpa,
      approvedCourses,
      currentCourses,
      curriculumProgress,
      remainingSemesters
    });

    return `
      <div class="profile-container">
        <!-- Header del perfil -->
        <div class="profile-header">
          <button class="back-btn" id="backToHome">
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </button>
          <h1>Perfil de Usuario</h1>
        </div>

        <!-- Información principal del usuario -->
        <div class="profile-main">
          <div class="profile-card">
            <div class="profile-avatar-section">
              <div class="profile-avatar-large">${avatarContent}</div>
              <button class="change-avatar-btn">
                <i class="fas fa-camera"></i>
              </button>
            </div>
            
            <div class="profile-info-section">
              <h2>${fullName}</h2>
              <p class="profile-role">${role}</p>
              <p class="profile-email">${email}</p>
            </div>
          </div>
        </div>

        <!-- Detalles del usuario en cards -->
        <div class="profile-details">
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-user"></i>
              <h3>Información Personal</h3>
            </div>
            <div class="detail-card-body">
              <div class="detail-row">
                <span class="detail-label">Nombre completo:</span>
                <span class="detail-value">${fullName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">RUT:</span>
                <span class="detail-value">${rut}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Nombre de usuario:</span>
                <span class="detail-value">${username}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Correo electrónico:</span>
                <span class="detail-value">${email}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-graduation-cap"></i>
              <h3>Información Académica</h3>
            </div>
            <div class="detail-card-body">
              <div class="detail-row">
                <span class="detail-label">Carrera:</span>
                <span class="detail-value">${career}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Generación:</span>
                <span class="detail-value">${generation}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Nivel actual:</span>
                <span class="detail-value">${currentSemester}° Semestre</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Promedio:</span>
                <span class="detail-value">${gpa.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-chart-line"></i>
              <h3>Estadísticas</h3>
            </div>
            <div class="detail-card-body">
              <div class="stats-grid">
                <div class="stat-item">
                  <i class="fas fa-book"></i>
                  <div class="stat-content">
                    <span class="stat-number">${approvedCourses}</span>
                    <span class="stat-label">Ramos aprobados</span>
                  </div>
                </div>
                <div class="stat-item">
                  <i class="fas fa-clock"></i>
                  <div class="stat-content">
                    <span class="stat-number">${currentCourses}</span>
                    <span class="stat-label">Ramos actuales</span>
                  </div>
                </div>
                <div class="stat-item">
                  <i class="fas fa-trophy"></i>
                  <div class="stat-content">
                    <span class="stat-number">${curriculumProgress}%</span>
                    <span class="stat-label">Avance curricular</span>
                  </div>
                </div>
                <div class="stat-item">
                  <i class="fas fa-calendar-check"></i>
                  <div class="stat-content">
                    <span class="stat-number">${remainingSemesters}</span>
                    <span class="stat-label">Semestres restantes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones del perfil -->
        <div class="profile-actions">
          <button class="action-btn primary" onclick="alert('Función de edición de perfil próximamente')">
            <i class="fas fa-edit"></i>
            <span>Editar Perfil</span>
          </button>
          <button class="action-btn secondary" onclick="alert('Función de cambio de contraseña próximamente')">
            <i class="fas fa-key"></i>
            <span>Cambiar Contraseña</span>
          </button>
          <button class="action-btn secondary" onclick="alert('Configuración de notificaciones próximamente')">
            <i class="fas fa-bell"></i>
            <span>Notificaciones</span>
          </button>
        </div>
      </div>
    `;
  }

  setupBackNavigation() {
    // Escuchar evento de navegación hacia atrás
    window.addEventListener('navigateBack', () => {
      this.loadHome();
    });
  }

  loadHome() {
    if (!this.contentArea || !this.homeContent) return;
    
    this.contentArea.innerHTML = this.homeContent;
    
    // Restaurar highlight a "Malla Actual"
    this.setActiveMenuItem('home');
    
    console.log('✅ Volviendo al home');
  }

  setActiveMenuItem(itemType) {
    // Remover clase active de todos los menu-items
    const allMenuItems = document.querySelectorAll('.menu-item');
    allMenuItems.forEach(item => item.classList.remove('active'));
    
    // Remover clase active del nombre de usuario
    const userName = document.getElementById('userName');
    if (userName) {
      userName.classList.remove('active');
    }
    
    // Agregar clase active según el tipo
    if (itemType === 'profile') {
      if (userName) {
        userName.classList.add('active');
      }
    } else if (itemType === 'home') {
      // Buscar el menu-item que contiene "Malla Actual" y activarlo
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        const span = item.querySelector('span');
        if (span && span.textContent.includes('Malla Actual')) {
          item.classList.add('active');
        }
      });
    } else if (itemType === 'malla-actual') {
      // Buscar el menu-item que contiene "Malla Actual" y activarlo
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        const span = item.querySelector('span');
        if (span && span.textContent.includes('Malla Actual')) {
          item.classList.add('active');
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
  module.exports = { MainMenuApp, STORAGE_KEYS };
}
