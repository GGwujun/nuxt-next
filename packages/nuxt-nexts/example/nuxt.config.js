const { resolve } = require('path');

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  render: {
    resourceHints: false,
  },
  mode: 'spa',
  server: {
    port: 8000, // default: 3000
    host: '0.0.0.0', // default: localhost,
  },
  env: {
    TZ_ENV: process.env.NUXT_ENV_APID || 'test',
  },
  modules: [
    {
      handler: require('../'),
    },
  ],
};
