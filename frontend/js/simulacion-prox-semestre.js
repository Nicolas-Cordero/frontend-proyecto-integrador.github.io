(() => {
  const CLAVES = {
    DATOS_USUARIO: 'ucn_user_data'
  };

  const ENDPOINT_SIMULACION = 'http://localhost:4000/api/simulaciones/probar';

  class SimulacionProxSemestreApp {
    constructor() {
      this.botonGenerar = document.getElementById('btnGenerarSimulacionProx');
      this.panelResultado = document.getElementById('resultadoSimulacionProx');
      this.generando = false;
      this.configurarEventos();
    }

    configurarEventos() {
      if (this.botonGenerar) {
        this.botonGenerar.addEventListener('click', () => {
          this.generarSimulacion();
        });
      }

    }

    obtenerUsuarioActual() {
      try {
        const crudo = sessionStorage.getItem(CLAVES.DATOS_USUARIO);
        return crudo ? JSON.parse(crudo) : null;
      } catch (_) {
        return null;
      }
    }

    construirCarga() {
      const usuario = this.obtenerUsuarioActual();
      const carrera = usuario?.carreras && usuario.carreras[0] ? usuario.carreras[0] : null;

      // Fuente opcional de ramos disponibles si existe en la página
      const ramosDisponibles = Array.isArray(window?.DATOS_MALLA_ACTUAL?.ramos)
        ? window.DATOS_MALLA_ACTUAL.ramos
        : [];

      return {
        estudiante: {
          rut: usuario?.rut || null,
          email: usuario?.email || null,
          carreras: usuario?.carreras || []
        },
        carrera,
        ramosDisponibles
      };
    }

    async generarSimulacion() {
      const usuario = this.obtenerUsuarioActual();
      if (!usuario || !usuario.rut || !usuario.email) {
        this.mostrarMensaje('No hay sesión válida. Inicia sesión nuevamente.', 'error');
        return;
      }

      const carga = this.construirCarga();

      this.generando = true;
      this.actualizarEstadoBoton(true);

      try {
        const respuesta = await fetch(ENDPOINT_SIMULACION, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        this.mostrarMensaje(`No fue posible generar la simulación: ${error.message}`, 'error');
      } finally {
        this.generando = false;
        this.actualizarEstadoBoton(false);
      }
    }

    actualizarEstadoBoton(bloqueado) {
      if (!this.botonGenerar) {
        return;
      }

      this.botonGenerar.disabled = bloqueado;
      this.botonGenerar.textContent = bloqueado ? 'Generando...' : 'Generar Simulación';
    }

    notificarResultado(respuesta) {
      const mensaje = respuesta?.mensaje || 'Simulación creada correctamente.';
      if (respuesta?.simulacion?.enlace_json) {
        const enlace = respuesta.simulacion.enlace_json;
        this.mostrarMensaje(`${mensaje} <a href="http://localhost:4000${enlace}" target="_blank" rel="noopener noreferrer">Ver JSON</a>`, 'success');
      } else {
        this.mostrarMensaje(mensaje, 'success');
      }
    }

    mostrarMensaje(mensaje, tipo = 'info') {
      if (!this.panelResultado) return;

      const colores = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#3b82f6'
      };

      this.panelResultado.innerHTML = `<span style="color:${colores[tipo] || colores.info}">${mensaje}</span>`;
    }

    async cargarListaSimulaciones() {
      const usuario = this.obtenerUsuarioActual();
      if (!usuario || !usuario.rut) {
        this.renderizarLista([]);
        return;
      }

      try {
        const url = `http://localhost:4000/api/simulaciones/estudiante/${usuario.rut}?tipo=simulacion_siguiente_semestre`;
        console.log('[SimProx] Consultando simulaciones para RUT:', usuario.rut);
        
        const respuesta = await fetch(url);
        const lista = await respuesta.json();
        
        if (!respuesta.ok) {
          throw new Error(lista.error || 'Error al cargar simulaciones');
        }
        
        console.log('[SimProx] Simulaciones recibidas:', lista);
        this.renderizarLista(lista);
      } catch (error) {
        console.error('[SimProx] Error al cargar lista:', error);
        if (this.listaSimulaciones) {
          this.listaSimulaciones.innerHTML = `<li style="color:#ef4444">Error: ${error.message}</li>`;
        }
      }
    }

    async eliminarSimulacion(id) {
      if (!id) return;
      const confirmar = window.confirm('¿Eliminar esta simulación? Esta acción no se puede deshacer.');
      if (!confirmar) return;

      try {
        const res = await fetch(`http://localhost:4000/api/simulaciones/${id}`, { method: 'DELETE' });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'No fue posible eliminar la simulación');
        await this.cargarListaSimulaciones();
      } catch (e) {
        console.error('[SimProx] Error al eliminar simulación:', e);
        this.mostrarMensaje(`Error al eliminar: ${e.message}`, 'error');
      }
    }

    renderizarLista(lista) {
      if (!this.listaSimulaciones) return;

      if (!Array.isArray(lista) || lista.length === 0) {
        this.listaSimulaciones.innerHTML = '<li>No hay simulaciones registradas.</li>';
        return;
      }

      this.listaSimulaciones.innerHTML = '';
      for (const item of lista) {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';

        const left = document.createElement('div');
        const enlace = document.createElement('a');
        enlace.href = `http://localhost:4000${item.enlace_json}`;
        enlace.target = '_blank';
        enlace.rel = 'noopener noreferrer';
        enlace.textContent = `Simulación #${item.id} - ${new Date(item.creado_en).toLocaleDateString('es-CL')}`;
        left.appendChild(enlace);

        const btn = document.createElement('button');
        btn.textContent = '✖';
        btn.title = 'Eliminar simulación';
        btn.style.marginLeft = '8px';
        btn.style.border = 'none';
        btn.style.background = 'transparent';
        btn.style.color = '#ef4444';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.eliminarSimulacion(item.id);
        });

        li.appendChild(left);
        li.appendChild(btn);
        this.listaSimulaciones.appendChild(li);
      }
    }
  }

  function iniciarSimulacionProxSemestre() {
    if (window.simulacionProxSemestreApp) {
      window.simulacionProxSemestreApp = null;
    }
    window.simulacionProxSemestreApp = new SimulacionProxSemestreApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarSimulacionProxSemestre);
  } else {
    iniciarSimulacionProxSemestre();
  }

  if (typeof window !== 'undefined') {
    window.SimulacionProxSemestreApp = SimulacionProxSemestreApp;
  }
})();
