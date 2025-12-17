(function () {
  function ejecutarTesting(codigo, catalogo, cantCreditos) {
    const resultDiv = document.getElementById('resultadoProyeccion');

    const ejecutar = async () => {
      try {
        resultDiv.innerHTML = '<p style="color: #22c55e;">⏳ Ejecutando prueba...</p>';

        const usuario = JSON.parse(sessionStorage.getItem('ucn_user_data'));
        const rut = usuario.rut;

        const proyeccion = await window.prepararProyeccion(rut, codigo, catalogo, cantCreditos);

        resultDiv.innerHTML = `<h3 style="color: #22c55e; margin-top: 0;">✅ Proyección generada exitosamente</h3>`;
        window.renderizarProyeccion(proyeccion, resultDiv.id);
      } catch (error) {
        resultDiv.innerHTML = `\n<h3 style="color: #ef4444; margin-top: 0;">Error en la proyección:</h3>\n<pre style="color: #ef4444; background: var(--bg-code, #fff); padding: 1rem; border: 1px solid var(--border-color, #ddd); overflow-x: auto; border-radius: 4px; font-size: 0.85rem;">${error.message}\n\nStack: ${error.stack}</pre>\n          <p style="color: var(--text-secondary, #666);">Verifica la consola del navegador (F12) para más detalles.</p>\n        `;
      }
    };

    setTimeout(ejecutar, 500);
  }

  window.ejecutarTesting = ejecutarTesting;
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ejecutarTesting };
}