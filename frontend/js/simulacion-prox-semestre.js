(function(){
  const API_BASE = '/api/simulaciones';

  function getUsuario() {
    try {
      if (window.mainMenuApp && window.mainMenuApp.usuarioService) {
        return window.mainMenuApp.usuarioService.obtenerUsuario();
      }
      const crudo = sessionStorage.getItem('ucn_user_data');
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) {
      return null;
    }
  }

  function mostrarMensaje(el, html) {
    if (el) el.innerHTML = html;
  }

  async function postJSON(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { throw new Error(text || 'Respuesta inválida'); }
    if (!res.ok) throw new Error(json.error || json.detalle || 'Error de API');
    return json;
  }

  async function getJSON(url) {
    const res = await fetch(url);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { throw new Error(`Respuesta inválida (${res.status}): ${text}`); }
    if (!res.ok) throw new Error(`${json.error || json.detalle || 'Error de API'} (HTTP ${res.status})`);
    return json;
  }

  function renderLista(lista, contenedor) {
    if (!contenedor) return;
    if (!Array.isArray(lista) || lista.length === 0) {
      contenedor.innerHTML = '<li>No hay simulaciones registradas.</li>';
      return;
    }
    contenedor.innerHTML = '';
    for (const item of lista) {
      const li = document.createElement('li');
      const enlace = document.createElement('a');
      enlace.href = `${item.enlace_json}`;
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
      enlace.textContent = `Simulación #${item.id}`;
      li.appendChild(enlace);
      contenedor.appendChild(li);
    }
  }

  async function onGenerarClick() {
    const usuario = getUsuario();
    const panel = document.getElementById('resultadoSimulacionProx');
    if (!usuario) {
      mostrarMensaje(panel, '<span style="color:#ef4444">No hay usuario en sesión.</span>');
      return;
    }

    const carrera = Array.isArray(usuario.carreras) && usuario.carreras.length > 0 ? usuario.carreras[0] : null;
    if (!carrera) {
      mostrarMensaje(panel, '<span style="color:#ef4444">No se encontró información de carrera.</span>');
      return;
    }

    try {
      mostrarMensaje(panel, '<span>Generando simulación...</span>');
      const payload = {
        estudiante: { rut: usuario.rut, email: usuario.email, carreras: usuario.carreras || [] },
        carrera: { codigo: carrera.codigo || carrera.code || carrera.id, nombre: carrera.nombre || carrera.name, catalogo: carrera.catalogo || carrera.catalog },
        ramosDisponibles: []
      };
      const resp = await postJSON(`${API_BASE}/probar`, payload);
      const enlace = resp?.simulacion?.enlace_json ? `${resp.simulacion.enlace_json}` : null;
      mostrarMensaje(panel, enlace 
        ? `<span style="color:#22c55e">✅ Simulación lista.</span> <a href="${enlace}" target="_blank" rel="noopener noreferrer">Ver JSON</a>`
        : '<span style="color:#22c55e">✅ Simulación generada.</span>');
    } catch (e) {
      mostrarMensaje(panel, `<span style="color:#ef4444">${e.message}</span>`);
    }
  }

  async function onCargarListaClick() {
    const usuario = getUsuario();
    const contenedor = document.getElementById('listaSimulacionesProx');
    if (!usuario || !usuario.rut) {
      console.warn('[SimProx] No hay usuario o RUT en sesión');
      renderLista([], contenedor);
      return;
    }
    try {
      const url = `${API_BASE}/estudiante/${usuario.rut}?tipo=simulacion_siguiente_semestre`;
      console.log('[SimProx] Consultando simulaciones para RUT:', usuario.rut);
      console.log('[SimProx] URL completa:', url);
      const lista = await getJSON(url);
      console.log('[SimProx] Respuesta recibida:', lista);
      renderLista(lista, contenedor);
    } catch (e) {
      console.error('[SimProx] Error al cargar lista:', e);
      contenedor.innerHTML = `<li style="color:#ef4444">Error: ${e.message}</li>`;
    }
  }

  function bind() {
    const btnGen = document.getElementById('btnGenerarSimulacionProx');
    const btnList = document.getElementById('btnCargarSimulacionesProx');
    if (btnGen) btnGen.addEventListener('click', onGenerarClick);
    if (btnList) btnList.addEventListener('click', onCargarListaClick);
  }

  // Ejecuta el bind cuando se inyecta el HTML
  try { bind(); } catch (_) { /* noop */ }
})();
