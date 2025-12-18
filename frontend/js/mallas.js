/**
 * mallas.js
 * 
 * Responsabilidad: Orquestador principal
 * 
 * Flujo:
 * 1. Obtiene datos desde mallas-api.js
 * 2. Si falla, usa DEFAULT_MALLA como fallback
 * 3. Renderiza con mallas-ui.js
 */

// IIFE para permitir re-inyecciones sin conflicto
(function() {
  'use strict';

  let carreraSeleccionada = null;
  let carreras = [];

  async function inicializarSelectorCarrera() {
    const selectorContainer = document.getElementById('selectorCarreraMallaContainer');
    const selector = document.getElementById('selectCarreraMalla');
    
    if (!selectorContainer || !selector) {
      await inicializarMallas();
      return;
    }

    try {
      const usuarioData = sessionStorage.getItem('ucn_user_data');
      if (!usuarioData) {
        await inicializarMallas();
        return;
      }

      const usuario = JSON.parse(usuarioData);
      carreras = Array.isArray(usuario.carreras) ? usuario.carreras : [];

      if (carreras.length > 1) {
        selectorContainer.style.display = 'block';
        selector.innerHTML = '<option value="">-- Seleccionar carrera --</option>';
        
        carreras.forEach((carrera, index) => {
          const option = document.createElement('option');
          const codigo = carrera.codigo || carrera.code || '';
          option.value = codigo;
          option.textContent = carrera.nombre || carrera.name || codigo;
          option.dataset.catalogo = carrera.catalogo || carrera.catalog || '';
          option.dataset.carrera = JSON.stringify(carrera);
          selector.appendChild(option);
        });

        selector.addEventListener('change', async (e) => {
          const codigoCarrera = e.target.value;
          if (codigoCarrera) {
            const option = e.target.options[e.target.selectedIndex];
            const carreraData = option.dataset.carrera ? JSON.parse(option.dataset.carrera) : null;
            const carrera = carreraData || carreras.find(c => 
              (c.codigo && c.codigo === codigoCarrera) ||
              (c.code && c.code === codigoCarrera)
            );
            if (carrera) {
              carreraSeleccionada = carrera;
              window.DATOS_MALLA_ACTUAL = [];
              await cargarMallaParaCarrera(codigoCarrera, carrera.catalogo || carrera.catalog);
            }
          }
        });

        const primeraCarrera = carreras[0];
        const codigoPrimera = primeraCarrera?.codigo || primeraCarrera?.code || null;
        if (codigoPrimera) {
          selector.value = codigoPrimera;
          carreraSeleccionada = primeraCarrera;
          window.DATOS_MALLA_ACTUAL = [];
          await cargarMallaParaCarrera(codigoPrimera, primeraCarrera.catalogo || primeraCarrera.catalog);
        }
      } else if (carreras.length === 1) {
        carreraSeleccionada = carreras[0];
        const codigo = carreraSeleccionada.codigo || carreraSeleccionada.code || null;
        if (codigo) {
          await cargarMallaParaCarrera(codigo);
        } else {
          await inicializarMallas();
        }
      } else {
        await inicializarMallas();
      }
    } catch (error) {
      console.warn('[mallas] Error al inicializar selector de carrera:', error);
      await inicializarMallas();
    }
  }

  async function cargarMallaParaCarrera(codigoCarrera, catalogo = null) {
    try {
      window.DATOS_MALLA_ACTUAL = [];
      
      const semestre = catalogo || '202320';
      let datos = await window.obtenerMallas(codigoCarrera, semestre);
      
      if (!datos || datos.length === 0) {
        console.warn('[mallas] No se obtuvieron datos para código', codigoCarrera, 'con semestre', semestre, '- usando DEFAULT_MALLA');
        window.DATOS_MALLA_ACTUAL = window.DEFAULT_MALLA || [];
        window.renderizarMalla(window.DEFAULT_MALLA || []);
        return;
      }

      window.DATOS_MALLA_ACTUAL = datos;
      window.renderizarMalla(datos);
    } catch (error) {
      console.warn('[mallas] Error al cargar malla, usando DEFAULT_MALLA', error);
      window.DATOS_MALLA_ACTUAL = window.DEFAULT_MALLA || [];
      window.renderizarMalla(window.DEFAULT_MALLA || []);
    }
  }

  /**
   * Inicializa la malla
   */
  async function inicializarMallas(urlApi) {
    // 1. Obtener datos desde API (o proxy)
    let datos = await window.obtenerMallas(urlApi);

    // 2. Fallback a datos por defecto si falla
    if (!datos) {
      console.warn('[mallas] Usando datos por defecto');
      datos = window.DEFAULT_MALLA;
    }

    // 3. Renderizar en la página
    window.renderizarMalla(datos);
  }

  // Ejecutar cuando DOM esté listo O inmediatamente si ya está cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      inicializarSelectorCarrera();
    });
  } else {
    // DOM ya está listo (scripts cargados dinámicamente)
    inicializarSelectorCarrera();
  }

})(); // Cierre del IIFE

