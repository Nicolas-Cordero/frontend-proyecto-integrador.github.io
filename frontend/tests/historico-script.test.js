global.window = global;
global.document = document;
global.sessionStorage = sessionStorage;

const mod = require('../js/historico-script.js');
const HistoricoApp = mod.HistoricoApp || global.HistoricoApp || window.HistoricoApp;

describe('HistoricoApp cargarProyeccionesDesdeDatos y helpers', () => {
  test('renderizarEstadoInicial pone mensaje cuando no hay datos', () => {
    const cont = document.createElement('div');
    cont.id = 'contenedorColumnas';
    document.body.appendChild(cont);

    // crear instancia sin ejecutar constructor
    const instancia = Object.create(HistoricoApp.prototype);
    instancia.contenedorColumnas = cont;
    instancia.renderizarEstadoInicial();

    expect(cont.innerHTML).toContain('No hay proyecciones guardadas');
  });

  test('cargarProyeccionesDesdeDatos genera columnas y ramos correctamente', () => {
    const cont = document.createElement('div');
    cont.id = 'contenedorColumnas';
    document.body.appendChild(cont);

    const instancia = Object.create(HistoricoApp.prototype);
    instancia.contenedorColumnas = cont;

    const datos = [
      { course: 'DCCB-00106', status: 'APROBADO', period: '202310', asignatura: 'Cálculo I' },
      { course: 'DCCB-00107', status: 'REPROBADO', period: '202310', asignatura: 'Álgebra I' },
      { course: 'DCCB-00204', status: 'PENDIENTE', period: '202320', asignatura: 'Programación' }
    ];

    instancia.cargarProyeccionesDesdeDatos(datos);

    const columnas = cont.querySelectorAll('.columna');
    expect(columnas.length).toBeGreaterThan(0);

    const primeros = cont.querySelectorAll('.ramo');
    expect(primeros.length).toBe(3);
    expect(firstTextContent(cont)).toContain('DCCB-00106');
  });

  test('guardarCarreraSeleccionada y obtenerCarreraGuardada funcionan con sessionStorage', () => {
    sessionStorage.clear();
    const instancia = Object.create(HistoricoApp.prototype);
    const carrera = { codigo: 'C-1', nombre: 'Test' };
    instancia.guardarCarreraSeleccionada(carrera);

    const encontrada = instancia.obtenerCarreraGuardada([carrera]);
    expect(encontrada).toBeDefined();
    expect(encontrada.codigo || encontrada.code || encontrada.cod).toBe('C-1');
  });
});

function firstTextContent(container){
  return container.textContent || '';
}
