/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  globalSetup: './src/tests/globalSetup.js',
  testMatch: ['**/tests/**/*.test.js'],
  forceExit: true,
}
