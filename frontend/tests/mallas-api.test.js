global.window = global;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('mallas-api obtenerMallas', () => {
  test('debe retornar datos cuando fetch responde ok', async () => {
    require('../js/mallas-api.js');

    const mockData = [{ codigo: 'X', asignatura: 'Test', nivel: 1 }];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockData)
    });

    const datos = await window.obtenerMallas('8266', '202320');

    expect(global.fetch).toHaveBeenCalled();
    expect(datos).toEqual(mockData);
  });

  test('debe retornar DEFAULT_MALLA cuando fetch lanza excepción', async () => {
    require('../js/mallas-api.js');

    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network'));

    const datos = await window.obtenerMallas('8266');

    expect(datos).toEqual(window.DEFAULT_MALLA);
  });

  test('debe retornar DEFAULT_MALLA cuando response.ok es false', async () => {
    require('../js/mallas-api.js');

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false
    });

    const datos = await window.obtenerMallas('8266');

    expect(datos).toEqual(window.DEFAULT_MALLA);
  });

  test('cuando se pasa una URL absoluta la usa tal cual', async () => {
    require('../js/mallas-api.js');

    const url = 'http://example.test/mallas.json';
    const mockData = [{ codigo: 'URL', asignatura: 'Desde URL' }];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockData)
    });

    const datos = await window.obtenerMallas(url);

    expect(global.fetch).toHaveBeenCalledWith(url);
    expect(datos).toEqual(mockData);
  });
});
