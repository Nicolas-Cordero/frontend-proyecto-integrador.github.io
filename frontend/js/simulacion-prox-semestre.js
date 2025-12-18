(() => {
  const CLAVES = { DATOS_USUARIO: 'ucn_user_data' };
  const ENDPOINT_SIMULACION = 'http://localhost:4000/api/simulaciones/probar';

  class SimulacionProxSemestreApp {
    constructor() {
      this.btn = document.getElementById('botonProbarSimulacion');
      this.estado = document.getElementById('estadoSimulacion');
      this.resultado = document.getElementById('resultadoSimulacion');
      this.generando = false;
      this.configurarEventos();
    }

    configurarEventos() {
      if (!this.btn) return;
      this.btn.addEventListener('click', () => this.generar());
    }

    getUsuario() {
      const crudo = sessionStorage.getItem(CLAVES.DATOS_USUARIO);
      if (!crudo) return null;
      try { return JSON.parse(crudo); } catch { return null; }
    }

    construirCarrera(usuario) {
      if (Array.isArray(usuario.carreras) && usuario.carreras.length) {
        const c0 = usuario.carreras[0];
        if (c0 && typeof c0 === 'object') return c0;
        if (typeof c0 === 'string') return { nombre: c0 };
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
      if (!origen.length && window.DEFAULT_MALLA) return window.DEFAULT_MALLA;
      return origen.map((ramo) => ({
        codigo: ramo.codigo || ramo.code || null,
        nombre: ramo.asignatura || ramo.nombre || ramo.name || 'Ramo sin nombre',
        nivel: ramo.nivel || ramo.level || null,
        creditos: ramo.creditos || ramo.credits || ramo.horas || null
      })).filter((r) => Boolean(r.nombre));
    }

    construirCarga(usuario) {
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
        carrera: this.construirCarrera(usuario),
        academicInfo: usuario.academicInfo,
        ramosDisponibles: this.obtenerRamosDisponibles()
      };
    }

    actualizarEstado(bloqueado, texto) {
      if (this.btn) {
        this.btn.disabled = bloqueado;
        this.btn.textContent = bloqueado ? 'Generando...' : 'Generar Simulación';
      }
      if (this.estado) this.estado.textContent = texto || (bloqueado ? 'Generando…' : 'Listo para generar');
    }

    mostrarResultado(res) {
      const mensaje = res?.mensaje || 'Simulación creada correctamente.';
      const enlace = res?.simulacion?.enlace_json;
      this.resultado.innerHTML = enlace
        ? `${mensaje}<br><a href="${enlace}" target="_blank" rel="noopener">Descargar JSON</a>`
        : mensaje;
    }

    async generar() {
      if (this.generando) return;
      const usuario = this.getUsuario();
      if (!usuario) { alert('Debes iniciar sesión nuevamente para generar una simulación.'); return; }

      const carga = this.construirCarga(usuario);
      if (!carga.carrera) { alert('No hay una carrera asociada al usuario.'); return; }

      this.generando = true;
      this.actualizarEstado(true, 'Generando…');
      try {
        const resp = await fetch(ENDPOINT_SIMULACION, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carga)
        });
        const cuerpo = await resp.json();
        if (!resp.ok) {
          const detalle = cuerpo?.detalle ? ` Detalle: ${cuerpo.detalle}` : '';
          throw new Error(`${cuerpo?.error || 'Error desconocido.'}${detalle}`);
        }
        this.mostrarResultado(cuerpo);
      } catch (e) {
        console.error('Falló la generación de la simulación.', e);
        alert('No fue posible generar la simulación. Intenta nuevamente.');
      } finally {
        this.generando = false;
        this.actualizarEstado(false, 'Listo para generar');
      }
    }
  }

  function init() {
    window.simulacionProxSemestreApp = new SimulacionProxSemestreApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
