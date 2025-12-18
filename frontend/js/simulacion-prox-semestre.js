(() => {
  const CLAVES = { DATOS_USUARIO: 'ucn_user_data' };
  const ENDPOINT_SIMULACION = 'http://localhost:4000/api/simulaciones/probar';
  const CREDITOS_MAXIMOS_SEMESTRE = 50; // Ajusta según necesites

  class SimulacionProxSemestreApp {
    constructor() {
      this.btn = document.getElementById('botonProbarSimulacion');
      this.estado = document.getElementById('estadoSimulacion');
      this.resultado = document.getElementById('resultadoSimulacion');
      this.ramosContainer = document.getElementById('ramosAdelantablesContainer');
      this.ramosCounter = document.getElementById('ramosCounter');
      this.generando = false;
      this.ramosAdelantables = [];
      this.ramosSeleccionados = new Set();
      this.configurarEventos();
      this.cargarRamosAdelantables();
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
      let origen = Array.isArray(window.DATOS_MALLA_ACTUAL) ? window.DATOS_MALLA_ACTUAL : [];
      
      // Si no hay datos, intentar usar DEFAULT_MALLA
      if (!origen.length && window.DEFAULT_MALLA) {
        origen = window.DEFAULT_MALLA;
      }
      
      console.log('Origen de datos:', origen);
      
      return origen.map((ramo) => {
        // Normalizar las propiedades que pueden tener diferentes nombres
        const ramoNormalizado = {
          codigo: ramo.codigo || ramo.code || '',
          nombre: ramo.asignatura || ramo.nombre || ramo.name || 'Ramo sin nombre',
          nivel: ramo.nivel || ramo.level || 1,
          creditos: ramo.creditos || ramo.credits || ramo.horas || 0,
          prereq: ramo.prereq || ramo.prerequisites || ''
        };
        
        console.log('Ramo normalizado:', ramoNormalizado);
        return ramoNormalizado;
      }).filter((r) => Boolean(r.nombre && r.codigo));
    }

    async cargarRamosAdelantables() {
      try {
        const usuario = this.getUsuario();
        if (!usuario) {
          this.mostrarMensajeRamos('Debes iniciar sesión para ver los ramos disponibles.');
          return;
        }

        // Cargar la malla completa explícitamente si no está disponible
        let mallaCompleta = this.obtenerRamosDisponibles();
        
        if (!mallaCompleta || mallaCompleta.length === 0) {
          console.log('Cargando malla desde API...');
          try {
            const mallaCargada = await window.obtenerMallas();
            if (mallaCargada && mallaCargada.length > 0) {
              window.DATOS_MALLA_ACTUAL = mallaCargada;
              mallaCompleta = this.obtenerRamosDisponibles();
            }
          } catch (error) {
            console.warn('Error al cargar malla desde API, usando DEFAULT_MALLA', error);
          }
        }

        console.log('Malla completa:', mallaCompleta);
        
        // Obtener el avance del estudiante
        const avanceData = await this.obtenerAvanceEstudiante(usuario.rut);
        
        // Procesar datos para obtener ramos aprobados y pendientes
        const { codigosAprobados, ramosPendientes } = this.procesarAvance(avanceData, mallaCompleta);
        
        console.log('Ramos pendientes:', ramosPendientes);
        console.log('Códigos aprobados:', Array.from(codigosAprobados));
        
        // Filtrar ramos adelantables (que cumplen prerequisitos)
        this.ramosAdelantables = ramosPendientes.filter(ramo => 
          this.validarPrerequisitos(ramo, codigosAprobados)
        );

        console.log('Ramos adelantables:', this.ramosAdelantables);

        if (this.ramosAdelantables.length === 0) {
          this.mostrarMensajeRamos('No hay ramos disponibles para adelantar en este momento.');
          return;
        }

        this.renderizarRamosAdelantables();
      } catch (error) {
        console.error('Error al cargar ramos adelantables:', error);
        this.mostrarMensajeRamos('Error al cargar los ramos disponibles. Intenta nuevamente.');
      }
    }

    async obtenerAvanceEstudiante(rut) {
      try {
        const response = await fetch(`http://localhost:4000/api/estudiantes/${rut}/avance`);
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.warn('Error al obtener avance del estudiante:', error);
        return [];
      }
    }

    procesarAvance(avanceData, mallaData) {
      if (!avanceData || !Array.isArray(avanceData)) {
        avanceData = [];
      }
      if (!mallaData || !Array.isArray(mallaData)) {
        mallaData = [];
      }

      const aprobados = avanceData.filter(item => 
        (item.status || '').toUpperCase() === 'APROBADO'
      );

      const codigosAprobados = new Set(aprobados.map(item => item.course));

      const pendientes = mallaData.filter(ramo => !codigosAprobados.has(ramo.codigo));

      return {
        ramosAprobados: aprobados,
        ramosPendientes: pendientes,
        codigosAprobados: codigosAprobados
      };
    }

    validarPrerequisitos(ramo, codigosAprobados) {
      if (!ramo.prereq || ramo.prereq.trim() === '') {
        return true;
      }

      const prereqs = ramo.prereq.split(',').map(p => p.trim()).filter(p => p);

      for (let prereq of prereqs) {
        if (!codigosAprobados.has(prereq)) {
          return false;
        }
      }
      return true;
    }

    mostrarMensajeRamos(mensaje) {
      if (this.ramosContainer) {
        this.ramosContainer.innerHTML = `<p style="color:var(--muted);text-align:center">${mensaje}</p>`;
      }
    }

    renderizarRamosAdelantables() {
      if (!this.ramosContainer) return;

      let html = '<div style="display:flex;flex-direction:column;gap:0.5rem">';
      
      this.ramosAdelantables.forEach((ramo, index) => {
        const checkboxId = `ramo-${index}`;
        const nombre = ramo.nombre || ramo.asignatura || ramo.name || 'Sin nombre';
        const codigo = ramo.codigo || ramo.code || 'N/A';
        const nivel = ramo.nivel || ramo.level || 'N/A';
        const creditos = ramo.creditos || ramo.credits || ramo.horas || 'N/A';
        
        html += `
          <label for="${checkboxId}" style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:all 0.2s" class="ramo-item">
            <input type="checkbox" id="${checkboxId}" data-codigo="${codigo}" style="cursor:pointer;width:18px;height:18px">
            <div style="flex:1">
              <div style="font-weight:500;margin-bottom:0.25rem">${nombre}</div>
              <div style="font-size:0.85rem;color:var(--muted)">
                Código: ${codigo} | Nivel: ${nivel} | Créditos: ${creditos}
              </div>
            </div>
          </label>
        `;
      });
      
      html += '</div>';
      
      this.ramosContainer.innerHTML = html;

      // Agregar eventos a los checkboxes
      this.ramosContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => this.manejarSeleccion(e));
      });

      // Agregar estilos hover
      this.ramosContainer.querySelectorAll('.ramo-item').forEach(item => {
        item.addEventListener('mouseenter', (e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f5f5f5)';
        });
        item.addEventListener('mouseleave', (e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        });
      });
    }

    manejarSeleccion(event) {
      const checkbox = event.target;
      const codigo = checkbox.dataset.codigo;
      
      if (checkbox.checked) {
        this.ramosSeleccionados.add(codigo);
      } else {
        this.ramosSeleccionados.delete(codigo);
      }

      this.actualizarContador();
      console.log('Ramos seleccionados:', Array.from(this.ramosSeleccionados));
    }

    actualizarContador() {
      if (this.ramosCounter) {
        const count = this.ramosSeleccionados.size;
        const countSpan = this.ramosCounter.querySelector('.count');
        
        if (count > 0) {
          this.ramosCounter.style.display = 'inline-flex';
          if (countSpan) countSpan.textContent = count;
        } else {
          this.ramosCounter.style.display = 'none';
        }
      }
    }

    construirCarga(usuario) {
      // Filtrar solo los ramos seleccionados
      const todosRamosDisponibles = this.obtenerRamosDisponibles();
      const ramosParaSimulacion = todosRamosDisponibles.filter(ramo => 
        this.ramosSeleccionados.has(ramo.codigo || ramo.code)
      );

      console.log('Ramos para simulación:', ramosParaSimulacion);

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
        ramosDisponibles: ramosParaSimulacion, // Solo los ramos seleccionados
        ramosSeleccionados: Array.from(this.ramosSeleccionados) // Enviar también el array de códigos
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

      // Validar que se hayan seleccionado ramos
      if (this.ramosSeleccionados.size === 0) {
        alert('Debes seleccionar al menos un ramo para generar la simulación.');
        return;
      }

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
