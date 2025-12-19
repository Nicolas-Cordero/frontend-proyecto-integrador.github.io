global.window = global;

describe('mis-simulaciones', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    document.body.innerHTML = `
      <select id="simulaciones">
        <option value="">--</option>
      </select>
      <button id="borrarSimulacion"></button>
      <button id="iniciarFetch"></button>
      <button id="descargarSimulacion"></button>
      <div id="contenedorMalla"></div>
      <div id="Datos"></div>
    `;
    require('../js/mis-simulaciones.js');

    // Stub global helpers
    global.alert = jest.fn();
    global.confirm = jest.fn().mockReturnValue(true);
  });

  test('actualizarEstadoBotones habilita/ deshabilita según selección (vía evento)', () => {
    const select = document.getElementById('simulaciones');
    const borrar = document.getElementById('borrarSimulacion');
    const ver = document.getElementById('iniciarFetch');
    const descargar = document.getElementById('descargarSimulacion');

    // initial no selection -> disabled
    expect(borrar.disabled).toBe(true);
    expect(ver.disabled).toBe(true);
    expect(descargar.disabled).toBe(true);

    // add selection and dispatch change event to trigger internal handler
    const opt = document.createElement('option'); opt.value = '1'; opt.text = 'test';
    select.appendChild(opt);
    select.value = '1';
    select.dispatchEvent(new Event('change'));

    expect(borrar.disabled).toBe(false);
    expect(ver.disabled).toBe(false);
    expect(descargar.disabled).toBe(false);
  });

  test('descargarSimulacion muestra alerta si no hay selección', async () => {
    await window.descargarSimulacion();
    expect(global.alert).toHaveBeenCalledWith('Por favor selecciona una simulación para descargar');
  });

  test('descargarSimulacion realiza descarga cuando fetch ok', async () => {
    const select = document.getElementById('simulaciones');
    const opt = document.createElement('option'); opt.value = '42'; opt.text = 't';
    select.appendChild(opt);
    select.value = '42';

    const fakeBlob = { size: 10 };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: jest.fn().mockResolvedValue(fakeBlob) });
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob://1');
    global.URL.revokeObjectURL = jest.fn();

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(document.body, 'removeChild');

    await window.descargarSimulacion();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/simulaciones/42/archivo');
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob://1');
  });

  test('fetchSimulacion transforma siguiente semestre y renderiza', async () => {
    const select = document.getElementById('simulaciones');
    const opt = document.createElement('option'); opt.value = '9'; opt.text = 't';
    select.appendChild(opt);
    select.value = '9';

    const malla = { tipo: 'simulacion_siguiente_semestre', cursos: [ { codigo: 'C1', nombre: 'N1', creditos: 3, nivel: 1 } ], creadoEn: 'hoy', estudiante: { rut: 'r' }, carrera: { nombre: 'C', codigo: 'c', catalogo: 'cat' } };

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue(malla) });
    window.renderizarProyeccion = jest.fn();

    await window.fetchSimulacion();

    expect(window.renderizarProyeccion).toHaveBeenCalled();
    const datosDiv = document.getElementById('Datos');
    expect(datosDiv.innerHTML).toContain('Fecha de creacion');
    expect(datosDiv.innerHTML).toContain('Rut:');
  });

  test('borrarSimulacion alerta si no hay seleccion', async () => {
    await window.borrarSimulacion();
    expect(global.alert).toHaveBeenCalledWith('Por favor selecciona una simulación para borrar');
  });

  test('borrarSimulacion borra y actualiza DOM cuando responde ok', async () => {
    // prepare select with two options
    const select = document.getElementById('simulaciones');
    const opt1 = document.createElement('option'); opt1.value = '1'; opt1.text = 'A';
    const opt2 = document.createElement('option'); opt2.value = '2'; opt2.text = 'B';
    select.appendChild(opt1); select.appendChild(opt2);
    select.value = '2'; select.selectedIndex = 2; // account for placeholder index

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({}) });
    // spy on functions
    window.poblarSimulaciones = jest.fn().mockResolvedValue();
    window.actualizarEstadoBotones = jest.fn();

    // mock confirm as true
    global.confirm = jest.fn().mockReturnValue(true);
    global.alert = jest.fn();

    const cont = document.getElementById('contenedorMalla');
    cont.innerHTML = '<div>something</div>';
    const datos = document.getElementById('Datos'); datos.innerHTML = 'info';

    await window.borrarSimulacion();

    expect(global.alert).toHaveBeenCalledWith('Simulación borrada correctamente');
    // option removed
    expect(Array.from(select.options).some(o => o.value === '2')).toBe(false);
    expect(cont.innerHTML).toContain('Selecciona una simulación');
    expect(datos.innerHTML).toBe('Sin selección');
    expect(window.poblarSimulaciones).toHaveBeenCalled();
  });
});
