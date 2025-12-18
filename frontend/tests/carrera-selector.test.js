global.window = global;
global.document = document;

require('../js/carrera-selector.js');

describe('CarreraSelector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('no falla cuando no hay contenedor', () => {
    const selector = new global.CarreraSelector({ contenedor: '#noExiste', carreras: [] });
    expect(selector.contenedor).toBeNull();
  });

  test('selecciona automáticamente si hay una sola carrera', () => {
    const cont = document.createElement('div');
    cont.id = 'c1';
    document.body.appendChild(cont);

    const carrera = { nombre: 'Ing. Civil', codigo: 'CIV-001' };
    const selector = new global.CarreraSelector({ contenedor: cont, carreras: [carrera] });

    expect(selector.obtenerCarreraSeleccionada()).toEqual(carrera);
    expect(selector.obtenerCodigoCarreraSeleccionada()).toBe('CIV-001');
  });

  test('renderiza select y dispara callback al cambiar', () => {
    const cont = document.createElement('div');
    cont.id = 'c2';
    document.body.appendChild(cont);

    const carreras = [
      { nombre: 'A', codigo: 'A-1' },
      { nombre: 'B', codigo: 'B-2' }
    ];

    const onSeleccionar = jest.fn();
    const selector = new global.CarreraSelector({ contenedor: cont, carreras, onSeleccionar });

    const select = cont.querySelector('#carreraSelect');
    expect(select).not.toBeNull();

    // Simular cambio
    select.value = '1';
    const event = new Event('change');
    select.dispatchEvent(event);

    expect(selector.obtenerCarreraSeleccionada()).toEqual(carreras[1]);
    expect(onSeleccionar).toHaveBeenCalledWith(carreras[1]);
  });
});
