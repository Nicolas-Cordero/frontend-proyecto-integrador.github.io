global.window = global;
global.document = document;

require('../js/historico-estadisticas.js');
const HistoricoEstadisticas = global.HistoricoEstadisticas || window.HistoricoEstadisticas;

describe('HistoricoEstadisticas - calcularEstadisticas y render', () => {
  test('calcularEstadisticas cuenta aprobados/reprobados/pendientes y periodos', () => {
    const instancia = new HistoricoEstadisticas({ contenedor: document.createElement('div') });

    const datos = [
      { status: 'APROBADO', inscriptionType: 'REGULAR', period: '202310' },
      { status: 'REPROBADO', inscriptionType: 'REGULAR', period: '202310' },
      { status: 'PENDIENTE', inscriptionType: 'EXTRA', period: '202320' },
      { status: 'APROBADO', inscriptionType: 'REGULAR', period: '202320' }
    ];

    const stats = instancia.calcularEstadisticas(datos);
    expect(stats.aprobados).toBe(2);
    expect(stats.reprobados).toBe(1);
    expect(stats.pendientes).toBe(1);
    expect(stats.totalPeriodos).toBe(2);
  });

  test('actualizarSinAnimar actualiza texto de elementos', () => {
    const cont = document.createElement('div');
    cont.id = 'estadisticasContainer';
    document.body.appendChild(cont);

    const instancia = new HistoricoEstadisticas({ contenedor: cont });
    instancia.actualizarSinAnimar({ aprobados: 5, reprobados: 1, pendientes: 2, totalPeriodos: 3 });

    expect(instancia.elementos.aprobados.textContent).toBe('5');
    expect(instancia.elementos.reprobados.textContent).toBe('1');
    expect(instancia.elementos.pendientes.textContent).toBe('2');
    expect(instancia.elementos.periodos.textContent).toBe('3');
  });

  test('animarNumero completa con valor final', () => {
    jest.useFakeTimers();
    const cont = document.createElement('div');
    cont.id = 'estadisticasContainer';
    document.body.appendChild(cont);
    const instancia = new HistoricoEstadisticas({ contenedor: cont });

    const el = document.createElement('span');
    instancia.animarNumero(el, 10);
    jest.advanceTimersByTime(1200);
    expect(el.textContent).toBe('10');
    jest.useRealTimers();
  });
});
