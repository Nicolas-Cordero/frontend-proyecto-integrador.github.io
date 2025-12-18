global.window = global;

beforeEach(() => {
  jest.resetModules();
  global.fetch = jest.fn();
});

require('../js/historico-avance-api.js');

describe('fetchJsonText / obtenerAvanceParaCarrera', () => {
  test('fetchJsonText parsea JSON correctamente', async () => {
    global.fetch.mockResolvedValueOnce({ text: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })) });
    const res = await global.fetchJsonText('http://test');
    expect(res).toEqual({ ok: true });
  });

  test('fetchJsonText lanza en JSON inválido', async () => {
    global.fetch.mockResolvedValueOnce({ text: jest.fn().mockResolvedValue('invalid json') });
    await expect(global.fetchJsonText('http://x')).rejects.toThrow(/Respuesta inválida JSON/);
  });

  test('obtenerAvanceParaCarrera retorna array cuando API responde array', async () => {
    const datos = [{ course: 'X', status: 'APROBADO' }];
    global.fetch.mockResolvedValueOnce({ text: jest.fn().mockResolvedValue(JSON.stringify(datos)) });
    const resultado = await global.obtenerAvanceParaCarrera('123', 'C1');
    expect(resultado).toEqual(datos);
  });

  test('obtenerAvanceParaCarrera retorna fallback cuando API responde error', async () => {
    global.fetch.mockResolvedValueOnce({ text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'fail' })) });
    const resultado = await global.obtenerAvanceParaCarrera('123', 'C1');
    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado).toBe(global.DATOS_FALLBACK_AVANCE);
  });

  test('obtenerAvanceParaCarrera retorna fallback cuando fetch lanza error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('network'));
    const resultado = await global.obtenerAvanceParaCarrera('123', 'C1');
    expect(resultado).toBe(global.DATOS_FALLBACK_AVANCE);
  });
});
