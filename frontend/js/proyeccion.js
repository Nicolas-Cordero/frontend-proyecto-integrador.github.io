 async function ejecutar() {
    const resultDiv = document.getElementById('resultadoProyeccion');
      
    try {
        resultDiv.innerHTML = '<p class="success">⏳ Ejecutando prueba...</p>';
        
        // Usar prepararProyeccion para crear una proyección
        const proyeccion = await window.prepararProyeccion(
          '222222222',  // RUT
          '8266',       // Código carrera
          '202410',     // Semestre
          30            // Créditos máximos por semestre
        );

    // Mostrar resultado
        resultDiv.innerHTML = `
          <h3 class="success">✅ Proyección generada exitosamente</h3>
          <pre>${JSON.stringify(proyeccion, null, 2)}</pre>
        `;
    } catch (error) {
        resultDiv.innerHTML = `
          <h3 class="error">❌ Error en la proyección:</h3>
          <pre class="error">${error.message}</pre>
          <p>Verifica que todos los scripts estén cargados y que fetchAvance y obtenerMallas estén disponibles.</p>
        `;
    }
}

if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ejecutar);
} else {
      ejecutar();
}