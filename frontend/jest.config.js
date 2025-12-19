module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'js/index-script.js',
    'js/main-menu-script.js',
    'js/perfil-usuario-script.js',
    'js/simulacion-prox-semestre.js',
    'js/dashboard-ross.js',
    'js/historico-script.js',
    'js/historico-estadisticas.js'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/js/$1'
  },
  verbose: true,
  testTimeout: 15000
};

