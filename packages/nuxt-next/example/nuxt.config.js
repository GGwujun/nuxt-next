const { resolve } = require('path');

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  render: {
    resourceHints: false,
  },
  layout: 'default',
  ssr:false,
  server: false,
  env: {
    TZ_ENV: process.env.NUXT_ENV_APID || 'test',
  },
  plugins:['~/plugins/axios.js','~/plugins/auth.js'],
  modules: [
    {
      handler: require('../'),
    },
  ],
  build: {},
  buildModules: [
    // 'nuxt-vite'
  ]
};
