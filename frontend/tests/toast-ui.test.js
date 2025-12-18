global.window = global;
global.document = document;

jest.useFakeTimers();

require('../js/toast-ui.js');

describe('ToastUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // ensure fresh instance
    if (global.toast && typeof global.toast.clearAll === 'function') {
      global.toast.clearAll();
    }
  });

  test('inicializa contenedor y estilos', () => {
    const t = new global.ToastUI();
    expect(document.getElementById('toast-container')).not.toBeNull();
    expect(document.getElementById('toast-styles')).not.toBeNull();
  });

  test('show/success/loading/create/update/remove/clearAll', () => {
    const t = new global.ToastUI();
    const id = t.success('Hecho', 1000);
    expect(document.getElementById(id)).not.toBeNull();

    // update
    t.update(id, 'Actualizado');
    expect(document.getElementById(id).querySelector('.toast-content').textContent).toBe('Actualizado');

    // loading (permanente)
    const lid = t.loading('Cargando');
    expect(document.getElementById(lid)).not.toBeNull();

    // remove specific
    t.remove(id);
    // advance timers for removal animation
    jest.advanceTimersByTime(400);
    expect(document.getElementById(id)).toBeNull();

    // clearAll should remove remaining toasts
    t.clearAll();
    jest.advanceTimersByTime(400);
    expect(document.querySelectorAll('.toast').length).toBe(0);
  });
});
