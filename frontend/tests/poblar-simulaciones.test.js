global.window = global;

describe('poblarSimulaciones', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <select id="simulaciones">
        <option value="">--</option>
      </select>
    `;
    global.sessionStorage.clear();
    require('../js/poblar-simulaciones.js');
  });

  test('agrega opciones desde la API y respeta filtro', async () => {
    sessionStorage.setItem('ucn_user_data', JSON.stringify({ rut: '999' }));

    const data = [ { id: '1', titulo: 'T1', tipo: 'simulacion_egreso' }, { id: '2', titulo: 'T2', tipo: 'simulacion_siguiente_semestre' } ];
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue(data) });

    await window.poblarSimulaciones('simulacion_egreso');

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/simulaciones/estudiante/999?tipo=simulacion_egreso'));
    const select = document.getElementById('simulaciones');
    expect(select.options.length).toBe(3); // placeholder + 2
    expect(select.options[1].value).toBe('1');
  });

  test('poblarSimulacionesEgreso y ProxSemestre llaman al base (verificando fetch)', async () => {
    // We verify the wrapper calls the base logic by checking the fetch URL constructed
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue([]) });

    await window.poblarSimulacionesEgreso();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('tipo=simulacion_egreso'));

    // reset mock and test prox semestre
    global.fetch.mockClear();
    await window.poblarSimulacionesProxSemestre();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('tipo=simulacion_siguiente_semestre'));
  });
});
