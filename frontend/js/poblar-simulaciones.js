(function () {
  'use strict';

  async function poblarSimulaciones() {
    const select = document.getElementById('simulaciones');
    if (!select) return;

    select.innerHTML = '<option value="">— Cargando opciones —</option>';

    let userData = null;
    try {
      userData = JSON.parse(sessionStorage.getItem('ucn_user_data'));
    } catch (_) { /* ignore */ }
    const rut = userData && userData.rut ? userData.rut : '222222222';

    try {
      const [respProx, respEgreso] = await Promise.all([
        fetch(`http://localhost:4000/api/simulaciones/estudiante/${rut}?tipo=simulacion_siguiente_semestre`),
        fetch(`http://localhost:4000/api/simulaciones/estudiante/${rut}?tipo=simulacion_egreso`)
      ]);

      const [prox, egreso] = await Promise.all([
        respProx.json(),
        respEgreso.json()
      ]);

      const opciones = [];
      if (Array.isArray(prox)) {
        for (const s of prox) opciones.push({ id: s.id, titulo: s.titulo, pref: '[Próx] ' });
      }
      if (Array.isArray(egreso)) {
        for (const s of egreso) opciones.push({ id: s.id, titulo: s.titulo, pref: '[Egreso] ' });
      }

      select.innerHTML = '';
      if (!opciones.length) {
        const op = document.createElement('option');
        op.value = '';
        op.textContent = '— No hay simulaciones —';
        select.appendChild(op);
        return;
      }

      opciones.sort((a, b) => (b.id || 0) - (a.id || 0));

      for (const o of opciones) {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = `${o.pref}${o.titulo || 'Simulación'} (#${o.id})`;
        select.appendChild(opt);
      }
    } catch (e) {
      console.error('Error al poblar simulaciones:', e);
      select.innerHTML = '<option value="">— Error al cargar —</option>';
    }
  }

  window.renderizarMalla = poblarSimulaciones;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', poblarSimulaciones);
  } else {
    poblarSimulaciones();
  }
})();
