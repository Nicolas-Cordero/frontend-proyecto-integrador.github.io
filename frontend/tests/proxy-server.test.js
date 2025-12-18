const fs = require('fs');
const path = require('path');

describe('proxy-server.js content checks', () => {
  test('contiene configuración de ruta y listen', () => {
    const p = path.join(__dirname, '..', 'js', 'proxy-server.js');
    const content = fs.readFileSync(p, 'utf8');
    expect(content).toContain('app.get');
    expect(content).toMatch(/app\.listen\(/);
    expect(content).toContain('API_URL');
  });
});
