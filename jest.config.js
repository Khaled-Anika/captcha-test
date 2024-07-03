module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    'canvas': 'jest-canvas-mock',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};