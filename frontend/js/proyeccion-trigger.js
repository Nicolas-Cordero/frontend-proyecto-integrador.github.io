(function () {
  function ejecutarTesting(codigo, catalogo, cantCreditos) {
    const resultDiv = document.getElementById('resultadoProyeccion');

    const ejecutar = async () => {
      try {
        resultDiv.innerHTML = '<p style="color: #22c55e;">⏳ Ejecutando prueba...</p>';

        const usuarioCrudo = sessionStorage.getItem('ucn_user_data');
        let usuario = null;
        try {
          usuario = usuarioCrudo ? JSON.parse(usuarioCrudo) : null;
        } catch (error) {
          usuario = null;
        }

        if (!usuario) {
          throw new Error('No se encontraron datos de usuario en la sesión.');
        }

        const rut = usuario.rut || '222222222';
        const semestre = '202410';

        const proyeccion = await window.prepararProyeccion(rut, codigo, catalogo, cantCreditos);

        const carreraUsuario = Array.isArray(usuario.carreras) && usuario.carreras.length ? usuario.carreras[0] : null;
        const carrera = typeof carreraUsuario === 'object' && carreraUsuario
          ? carreraUsuario
          : { nombre: `Carrera ${codigo}`, catalogo: codigo, codigo: codigo };

        try {
          const resp = await fetch('http://localhost:4000/api/simulaciones/proyeccion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              estudiante: {
                estudianteId: usuario.estudianteId || null,
                rut: rut,
                email: usuario.email || null,
                nombre: usuario.name || null,
                firstName: usuario.firstName || null,
                lastName: usuario.lastName || null,
                profilePicture: usuario.profilePicture || null
              },
              carrera,
              parametros: { rut: rut, codcarrera: codigo, semestre, creditosMaximos: cantCreditos },
              tipo: 'simulacion_egreso',
              contenido_json: proyeccion
            })
          });

          const cuerpo = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            console.error('Error al guardar la proyección en el backend:', cuerpo);
          } else {
            console.log('Simulación de egreso guardada exitosamente:', cuerpo);
          }
        } catch (error) {
          console.error('Error al guardar la proyección en el backend:', error);
        }

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