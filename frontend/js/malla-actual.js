(() => {
  // Vista Malla Actual sin lógica de "Probar Simulación".
  class MallaActualApp {
    constructor() {
      // Reservado para futuras funcionalidades propias de Malla Actual.
    }
  }

  function iniciarMallaActual() {
    window.mallaActualApp = new MallaActualApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarMallaActual);
  } else {
    iniciarMallaActual();
  }

  if (typeof window !== 'undefined') {
    window.MallaActualApp = MallaActualApp;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MallaActualApp };
  }
})();
