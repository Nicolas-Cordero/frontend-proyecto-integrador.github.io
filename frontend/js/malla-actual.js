(() => {
  const CLAVES_MALLA = {
    DATOS_USUARIO: 'ucn_user_data'
  };

  const ENDPOINT_SIMULACION = 'http://localhost:4000/api/simulaciones/probar';

  class MallaActualApp {
    constructor() {
      this.botonSimulacion = document.getElementById('botonProbarSimulacion');
      this.generando = false;
      this.configurarEventos();
    }

    configurarEventos() {
      if (!this.botonSimulacion) {
        return;
      }

      this.botonSimulacion.addEventListener('click', () => {
        this.generarSimulacion();
      });
    }

    obtenerUsuarioActual() {
      const crudo = sessionStorage.getItem(CLAVES_MALLA.DATOS_USUARIO);
      if (!crudo) {
        return null;
      }

      try {
        return JSON.parse(crudo);
      } catch (error) {
        console.error('No fue posible leer los datos del usuario.', error);
        return null;
      }
    }

    construirCarga(usuario) {
      const carreraPreferida = this.construirCarrera(usuario);
      return {
        tipo: 'simulacion_siguiente_semestre',
        estudiante: {
          estudianteId: usuario.estudianteId,
          rut: usuario.rut,
          email: usuario.email,
          nombre: usuario.name,
          firstName: usuario.firstName,
          lastName: usuario.lastName,
          profilePicture: usuario.profilePicture,
          carreras: usuario.carreras
        },
        carrera: carreraPreferida,
        academicInfo: usuario.academicInfo,
        ramosDisponibles: this.obtenerRamosDisponibles()
      };
    }

    construirCarrera(usuario) {
      if (Array.isArray(usuario.carreras) && usuario.carreras.length) {
        const primera = usuario.carreras[0];
        if (primera && typeof primera === 'object') {
          return primera;
        }
        if (typeof primera === 'string') {
          return { nombre: primera };
        }
      }

      const info = usuario.academicInfo || {};
      return {
        nombre: info.career || 'Carrera sin nombre',
        catalogo: info.catalog || null,
        generation: info.generation || null,
        currentSemester: info.currentSemester || null,
        totalSemesters: info.totalSemesters || null,
        gpa: info.gpa || null
      };
    }

    obtenerRamosDisponibles() {
      const origen = Array.isArray(window.DATOS_MALLA_ACTUAL) ? window.DATOS_MALLA_ACTUAL : [];
      if (!origen.length && window.DEFAULT_MALLA) {
        return window.DEFAULT_MALLA;
      }

      return origen
        .map((ramo) => ({
          codigo: ramo.codigo || ramo.code || null,
          nombre: ramo.asignatura || ramo.nombre || ramo.name || 'Ramo sin nombre',
          nivel: ramo.nivel || ramo.level || null,
          creditos: ramo.creditos || ramo.credits || ramo.horas || null
        }))
        .filter((ramo) => Boolean(ramo.nombre));
    }

    async generarSimulacion() {
      if (this.generando) {
        return;
      }

      const usuario = this.obtenerUsuarioActual();
      if (!usuario) {
        alert('Debes iniciar sesión nuevamente para generar una simulación.');
        return;
      }

      const carga = this.construirCarga(usuario);
      if (!carga.carrera) {
        alert('No hay una carrera asociada al usuario.');
        return;
      }

      this.generando = true;
      this.actualizarEstadoBoton(true);

      try {
        const respuesta = await fetch(ENDPOINT_SIMULACION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(carga)
        });

        const cuerpo = await respuesta.json();
        if (!respuesta.ok) {
          const detalle = cuerpo?.detalle ? ` Detalle: ${cuerpo.detalle}` : '';
          throw new Error(`${cuerpo?.error || 'Error desconocido.'}${detalle}`);
        }

        this.notificarResultado(cuerpo);
      } catch (error) {
        console.error('Falló la generación de la simulación.', error);
        alert('No fue posible generar la simulación. Intenta nuevamente.');
      } finally {
        this.generando = false;
        this.actualizarEstadoBoton(false);
      }
    }

    actualizarEstadoBoton(bloqueado) {
      if (!this.botonSimulacion) {
        return;
      }

      this.botonSimulacion.disabled = bloqueado;
      this.botonSimulacion.textContent = bloqueado ? 'Generando...' : 'Probar Simulación';
    }

    notificarResultado(respuesta) {
      const mensaje = respuesta?.mensaje || 'Simulación creada correctamente.';
      if (respuesta?.simulacion?.enlace_json) {
        alert(`${mensaje}\nDescarga: ${respuesta.simulacion.enlace_json}`);
        return;
      }
      alert(mensaje);
    }
  }

  function iniciarMallaActual() {
    if (window.mallaActualApp) {
      window.mallaActualApp = null;
    }
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
