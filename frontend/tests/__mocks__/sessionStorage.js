const crearMockSessionStorage = () => {
  let store = {};

  const storage = {
    getItem: (key) => {
      return store[key] || null;
    },
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };

  return storage;
};

const mockSessionStorage = crearMockSessionStorage();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
  configurable: true
});

module.exports = mockSessionStorage;

