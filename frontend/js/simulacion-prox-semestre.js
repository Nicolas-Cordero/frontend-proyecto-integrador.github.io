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
      this.selectorCarrera = document.getElementById('selectCarreraSimulacion');
      this.selectorCarreraContainer = document.getElementById('selectorCarreraContainer');
      this.generando = false;
      this.ramosAdelantables = [];
      this.ramosSeleccionados = new Set();
      this.carreraSeleccionada = null;
      this.carreras = [];
      this.configurarEventos();
      this.inicializarCarreras();
    }

    configurarEventos() {
      if (!this.btn) return;
      this.btn.addEventListener('click', () => this.generar());
      
      if (this.selectorCarrera) {
        this.selectorCarrera.addEventListener('change', (e) => {
          const carreraCodigo = e.target.value;
          if (carreraCodigo) {
            const carrera = this.carreras.find(c => 
              (c.codigo && c.codigo === carreraCodigo) ||
              (c.code && c.code === carreraCodigo)
            );
            if (carrera) {
              this.carreraSeleccionada = carrera;
              this.ramosSeleccionados.clear();
              this.actualizarContador();
              window.DATOS_MALLA_ACTUAL = [];
              this.cargarRamosAdelantables();
            }
          }
        });
      }
    }

    inicializarCarreras() {
      const usuario = this.getUsuario();
      if (!usuario) return;

      this.carreras = Array.isArray(usuario.carreras) ? usuario.carreras : [];
      
      if (this.carreras.length > 1 && this.selectorCarreraContainer && this.selectorCarrera) {
        this.selectorCarreraContainer.style.display = 'block';
        this.selectorCarrera.innerHTML = '<option value="">-- Seleccionar carrera --</option>';
        
        this.carreras.forEach(carrera => {
          const option = document.createElement('option');
          const codigo = carrera.codigo || carrera.code || '';
          option.value = codigo;
          option.textContent = carrera.nombre || carrera.name || codigo;
          option.dataset.catalogo = carrera.catalogo || carrera.catalog || '';
          this.selectorCarrera.appendChild(option);
        });
        
        const primeraCarrera = this.carreras[0];
        if (primeraCarrera) {
          const codigoPrimera = primeraCarrera.codigo || primeraCarrera.code || '';
          this.selectorCarrera.value = codigoPrimera;
          this.carreraSeleccionada = primeraCarrera;
          this.cargarRamosAdelantables();
        }
      } else if (this.carreras.length === 1) {
        this.carreraSeleccionada = this.carreras[0];
        this.cargarRamosAdelantables();
      } else {
        this.cargarRamosAdelantables();
      }
    }

    getUsuario() {
      const crudo = sessionStorage.getItem(CLAVES.DATOS_USUARIO);
      if (!crudo) return null;
      try { return JSON.parse(crudo); } catch { return null; }
    }

    construirCarrera(usuario) {
      if (this.carreraSeleccionada) {
        return {
          codigo: this.carreraSeleccionada.codigo || this.carreraSeleccionada.code || '',
          nombre: this.carreraSeleccionada.nombre || this.carreraSeleccionada.name || 'Carrera sin nombre',
          catalogo: this.carreraSeleccionada.catalogo || this.carreraSeleccionada.catalog || null
        };
      }
      
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
      
      return origen.map((ramo) => {
        // Normalizar las propiedades que pueden tener diferentes nombres
        const ramoNormalizado = {
          codigo: ramo.codigo || ramo.code || '',
          nombre: ramo.asignatura || ramo.nombre || ramo.name || 'Ramo sin nombre',
          nivel: ramo.nivel || ramo.level || 1,
          creditos: ramo.creditos || ramo.credits || ramo.horas || 0,
          prereq: ramo.prereq || ramo.prerequisites || ''
        };
        
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

        if (this.carreras.length > 1 && !this.carreraSeleccionada) {
          this.mostrarMensajeRamos('Por favor selecciona una carrera para ver los ramos disponibles.');
          return;
        }

        const carrera = this.carreraSeleccionada || (this.carreras.length > 0 ? this.carreras[0] : null);
        const codigoCarrera = carrera?.codigo || carrera?.code || null;
        const semestre = carrera?.catalogo || carrera?.catalog || usuario.academicInfo?.currentSemester || usuario.currentSemester || null;

        if (codigoCarrera) {
          try {
            window.DATOS_MALLA_ACTUAL = [];
            const mallaCargada = await window.obtenerMallas(codigoCarrera, semestre);
            if (mallaCargada && mallaCargada.length > 0) {
              window.DATOS_MALLA_ACTUAL = mallaCargada;
            } else {
              console.warn('No se obtuvieron datos de malla, usando DEFAULT_MALLA');
              window.DATOS_MALLA_ACTUAL = window.DEFAULT_MALLA || [];
            }
          } catch (error) {
            console.warn('Error al cargar malla desde API, usando DEFAULT_MALLA', error);
            window.DATOS_MALLA_ACTUAL = window.DEFAULT_MALLA || [];
          }
        } else {
          console.warn('No hay código de carrera disponible');
          window.DATOS_MALLA_ACTUAL = window.DEFAULT_MALLA || [];
        }

        const mallaCompleta = this.obtenerRamosDisponibles();
        
        // Obtener el avance del estudiante
        const avanceData = await this.obtenerAvanceEstudiante(usuario.rut, codigoCarrera);
        
        // Procesar datos para obtener ramos aprobados y pendientes
        const { codigosAprobados, ramosPendientes } = this.procesarAvance(avanceData, mallaCompleta);
        
        // Filtrar ramos adelantables (que cumplen prerequisitos)
        this.ramosAdelantables = ramosPendientes.filter(ramo => 
          this.validarPrerequisitos(ramo, codigosAprobados)
        );

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

    async obtenerAvanceEstudiante(rut, codigoCarrera = null) {
      try {
        let url = `http://localhost:4000/api/estudiantes/${rut}/avance`;
        if (codigoCarrera) {
          url += `?carrera=${encodeURIComponent(codigoCarrera)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          return [];
        }
        const avanceData = await response.json();
        if (!codigoCarrera || !Array.isArray(avanceData)) {
          return avanceData;
        }
        return avanceData;
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
      const simulacion = res?.simulacion;
      let enlaceDescarga = null;
      
      if (simulacion?.id) {
        enlaceDescarga = `http://localhost:4000/api/simulaciones/${simulacion.id}/archivo`;
      } else if (simulacion?.enlace_json) {
        // Si viene como ruta relativa, construir la URL completa
        enlaceDescarga = simulacion.enlace_json.startsWith('http') 
          ? simulacion.enlace_json 
          : `http://localhost:4000${simulacion.enlace_json}`;
      }
      
      this.resultado.innerHTML = enlaceDescarga
        ? `${mensaje}<br><a href="${enlaceDescarga}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: underline; margin-top: 0.5rem; display: inline-block;">Descargar JSON</a>`
        : mensaje;
    }

    async generar() {
      if (this.generando) return;
      const usuario = this.getUsuario();
      if (!usuario) { alert('Debes iniciar sesión nuevamente para generar una simulación.'); return; }

      if (this.carreras.length > 1 && !this.carreraSeleccionada) {
        alert('Por favor selecciona una carrera antes de generar la simulación.');
        return;
      }

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
