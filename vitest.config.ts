module.exports = {
  resolve: { alias: { '@': `${__dirname}/src` } },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
};
