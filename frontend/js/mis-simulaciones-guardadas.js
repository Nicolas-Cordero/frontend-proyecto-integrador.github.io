(function(){
  const API = 'http://localhost:4000/api/simulaciones';
  let filtro = 'simulacion_siguiente_semestre';

  function getUsuario() {
    try {
      const raw = sessionStorage.getItem('ucn_user_data');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function setBtnState(btnProx, btnEgreso) {
    btnProx?.setAttribute('aria-pressed', String(filtro === 'simulacion_siguiente_semestre'));
    btnEgreso?.setAttribute('aria-pressed', String(filtro === 'simulacion_egreso'));
  }

  async function cargarLista() {
    const user = getUsuario();
    const ul = document.getElementById('listaMisSimulaciones');
    if (!ul) return;
    if (!user?.rut) { ul.innerHTML = '<li>No hay usuario en sesión.</li>'; return; }

    ul.innerHTML = '<li>Cargando…</li>';
    try {
      const url = `${API}/estudiante/${user.rut}?tipo=${filtro}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al listar');
      renderLista(data, ul);
    } catch (e) {
      ul.innerHTML = `<li style="color:#ef4444">${e.message}</li>`;
    }
  }

  function renderLista(lista, ul) {
    if (!Array.isArray(lista) || lista.length === 0) {
      ul.innerHTML = '<li>No hay simulaciones registradas.</li>';
      return;
    }

    ul.innerHTML = '';
    for (const item of lista) {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';

      const left = document.createElement('div');
      const a = document.createElement('a');
      a.href = `http://localhost:4000${item.enlace_json}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = item.titulo ? `${item.titulo} (#${item.id})` : `Simulación #${item.id}`;
      left.appendChild(a);

      const btn = document.createElement('button');
      btn.textContent = '✖';
      btn.title = 'Eliminar simulación';
      btn.style.marginLeft = '8px';
      btn.style.border = 'none';
      btn.style.background = 'transparent';
      btn.style.color = '#ef4444';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        eliminar(item.id);
      });

      li.appendChild(left);
      li.appendChild(btn);
      ul.appendChild(li);
    }
  }

  async function eliminar(id) {
    if (!id) return;
    const ok = window.confirm('¿Eliminar esta simulación?');
    if (!ok) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const body = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(body?.error || 'No se pudo eliminar');
      await cargarLista();
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  }

  function bind() {
    const btnProx = document.getElementById('btnFiltroProx');
    const btnEgreso = document.getElementById('btnFiltroEgreso');
    const btnRef = document.getElementById('btnRefrescar');

    btnProx?.addEventListener('click', () => { filtro = 'simulacion_siguiente_semestre'; setBtnState(btnProx, btnEgreso); cargarLista(); });
    btnEgreso?.addEventListener('click', () => { filtro = 'simulacion_egreso'; setBtnState(btnProx, btnEgreso); cargarLista(); });
    btnRef?.addEventListener('click', cargarLista);

    setBtnState(btnProx, btnEgreso);
    cargarLista();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();