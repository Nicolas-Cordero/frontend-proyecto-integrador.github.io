const fs = require('fs');
const path = require('path');

test('malla-actual.js exists and is not empty', () => {
  const p = path.join(__dirname, '..', 'js', 'malla-actual.js');
  const content = fs.readFileSync(p, 'utf8');
  expect(content).toBeTruthy();
  expect(content.length).toBeGreaterThan(0);
});
