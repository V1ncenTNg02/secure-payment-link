/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./src/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  forceExit: true,
}
