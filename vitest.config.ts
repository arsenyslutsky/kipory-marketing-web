const { fileURLToPath } = require('node:url');
const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
});
