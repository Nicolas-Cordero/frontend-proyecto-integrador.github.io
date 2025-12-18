const mockSessionStorage = require('./__mocks__/sessionStorage');
require('./__mocks__/fetch');

global.beforeEach(() => {
  mockSessionStorage.clear();
});

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

