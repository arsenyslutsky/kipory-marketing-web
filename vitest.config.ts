module.exports = {
  resolve: { alias: { '@': `${process.cwd()}/src` } },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
};
