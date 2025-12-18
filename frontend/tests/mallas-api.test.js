global.window = global;

describe('mallas-api obtenerMallas', () => {
  beforeEach(() => {
    jest.resetModules();
    global.fetch = jest.fn();
  });

  test('retorna datos cuando fetch ok', async () => {
    const datos = [{ codigo: 'X' }];
    global.fetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(datos) });

    require('../js/mallas-api.js');

    const resultado = await global.obtenerMallas('http://test/api');
    expect(resultado).toEqual(datos);
  });

  test('retorna DEFAULT_MALLA cuando fetch responde no ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    require('../js/mallas-api.js');

    const resultado = await global.obtenerMallas('http://test/api');
    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado).toBe(global.DEFAULT_MALLA);
  });

  test('retorna DEFAULT_MALLA cuando fetch lanza error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('fail'));
    require('../js/mallas-api.js');

    const resultado = await global.obtenerMallas('http://test/api');
    expect(resultado).toBe(global.DEFAULT_MALLA);
  });
});
