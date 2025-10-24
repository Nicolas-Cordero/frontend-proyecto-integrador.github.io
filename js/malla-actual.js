// ===== MALLA ACTUAL - SCRIPT (PLACEHOLDER) =====

class MallaActualApp {
  constructor() {
    this.init();
  }

  init() {
    console.log('Malla Actual inicializada (placeholder)');
    this.setupBackButton();
    // TODO: Implementar funcionalidad de malla curricular
  }

  setupBackButton() {
    const backBtn = document.getElementById('backToHome');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Disparar evento de navegación de vuelta
        const event = new CustomEvent('navigateBack');
        window.dispatchEvent(event);
      });
    }
  }
}

// Inicialización
if (document.querySelector('.malla-actual-container')) {
  window.mallaActualApp = new MallaActualApp();
}

// Exportar para testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MallaActualApp };
}
