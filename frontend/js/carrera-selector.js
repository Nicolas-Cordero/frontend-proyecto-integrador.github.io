// carrera-selector.js
// Componente reutilizable para seleccionar carreras del usuario
(function() {
  'use strict';

  if (window.CarreraSelector) {
    delete window.CarreraSelector;
  }

  class CarreraSelector {
    constructor(opciones = {}) {
      this.selector = opciones.contenedor || '#carreraSelectorContainer';
      this.contenedor = this.resolverContenedor(this.selector);
      this.carreras = opciones.carreras || [];
      this.onSeleccionar = opciones.onSeleccionar || (() => {});
      this.carreraSeleccionada = null;
      this.estiloCompacto = opciones.estiloCompacto || false;

      if (!this.contenedor) {
        console.warn('[CarreraSelector] Contenedor no encontrado:', this.selector);
        return;
      }

      this.inicializar();
    }

    resolverContenedor(destino) {
      if (destino instanceof HTMLElement) return destino;
      if (typeof destino === 'string') return document.querySelector(destino);
      return null;
    }

    inicializar() {
      if (!Array.isArray(this.carreras) || this.carreras.length === 0) {
        this.contenedor.innerHTML = '';
        return;
      }

      // Si solo hay una carrera, seleccionarla automáticamente sin mostrar selector
      if (this.carreras.length === 1) {
        this.carreraSeleccionada = this.carreras[0];
        this.contenedor.innerHTML = '';
        return;
      }

      this.render();
      this.configurarEventos();
    }

    render() {
      if (!this.contenedor) return;

      const opcionesHtml = this.carreras.map((carrera, index) => `
        <option value="${index}" ${index === 0 ? 'selected' : ''}>
          ${carrera.nombre || carrera.name || `Carrera ${index + 1}`}
        </option>
      `).join('');

      if (this.estiloCompacto) {
        // Estilo compacto para usar en headers
        this.contenedor.innerHTML = `
          <select id="carreraSelect" style="
            padding: 0.375rem 0.625rem;
            border: 1px solid var(--border-color, #d1d5db);
            border-radius: 0.375rem;
            background: white;
            color: var(--text-primary, #1f2937);
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 150px;
          ">
            ${opcionesHtml}
          </select>
        `;
      } else {
        // Estilo completo con label
        this.contenedor.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <label for="carreraSelect" style="font-weight: 600; color: var(--text-primary, #1f2937); white-space: nowrap;">
              <i class="fas fa-graduation-cap" style="margin-right: 0.5rem;"></i>
              Seleccionar carrera:
            </label>
            <select id="carreraSelect" style="
              padding: 0.5rem 0.75rem;
              border: 1px solid var(--border-color, #d1d5db);
              border-radius: 0.375rem;
              background: white;
              color: var(--text-primary, #1f2937);
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.2s ease;
              min-width: 200px;
            ">
              ${opcionesHtml}
            </select>
          </div>
        `;
      }

      // Seleccionar la primera carrera por defecto
      this.carreraSeleccionada = this.carreras[0];
    }

    configurarEventos() {
      const select = this.contenedor.querySelector('#carreraSelect');
      if (!select) return;

      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.value, 10);
        if (index >= 0 && index < this.carreras.length) {
          this.carreraSeleccionada = this.carreras[index];
          this.onSeleccionar(this.carreraSeleccionada);
        }
      });
    }

    setCarreras(carreras) {
      this.carreras = Array.isArray(carreras) ? carreras : [];
      this.carreraSeleccionada = null;
      this.inicializar();
    }

    obtenerCarreraSeleccionada() {
      return this.carreraSeleccionada;
    }

    obtenerCodigoCarreraSeleccionada() {
      if (!this.carreraSeleccionada) return null;
      return this.carreraSeleccionada.codigo || 
             this.carreraSeleccionada.code || 
             this.carreraSeleccionada.cod || 
             this.carreraSeleccionada.catalogo ||
             this.carreraSeleccionada.catalog ||
             null;
    }
  }

  window.CarreraSelector = CarreraSelector;
})();
