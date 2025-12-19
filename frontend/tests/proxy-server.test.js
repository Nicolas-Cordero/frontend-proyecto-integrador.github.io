const http = require('http');

// Note: We intentionally require the module to start the server (it listens on port 3000 on import)
beforeAll(() => {
  jest.resetModules();
  require('../js/proxy-server.js');
});

afterAll(() => {
  // we don't have a handle to close the server because the file doesn't export it;
  // leaving it running in the test process is acceptable for local unit tests.
});

describe('proxy-server integration (uses axios internally)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.console.warn = jest.fn();
    global.console.error = jest.fn();
  });

  function httpGet(path) {
    return new Promise((resolve, reject) => {
      http.get({ hostname: 'localhost', port: 3000, path, agent: false }, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }).on('error', reject);
    });
  }

  test('devuelve datos cuando axios responde correctamente', async () => {
    const axios = require('axios');
    jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [{ codigo: 'A' }] });

    const res = await httpGet('/api/mallas?codigo=8266&semestre=202320');
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual([{ codigo: 'A' }]);
    expect(axios.get).toHaveBeenCalled();
  });

  test('usa DEFAULT url cuando no se pasa codigo', async () => {
    const axios = require('axios');
    jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [] });

    const res = await httpGet('/api/mallas');
    expect(res.statusCode).toBe(200);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('8606-202320'), expect.any(Object));
  });

  test('maneja error de axios y responde con status', async () => {
    const axios = require('axios');
    const err = new Error('fail');
    err.response = { status: 502, data: { error: 'bad' } };
    jest.spyOn(axios, 'get').mockRejectedValueOnce(err);

    const res = await httpGet('/api/mallas?codigo=X');
    expect(res.statusCode).toBe(502);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('error');
    expect(console.error).toHaveBeenCalled();
  });
});
