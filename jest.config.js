module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/docs/swagger.js'],
  testMatch: ['**/tests/**/*.test.js']
};
