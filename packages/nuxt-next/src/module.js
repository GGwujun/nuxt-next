const { resolve, join, basename } = require('path');
const { readdirSync } = require('fs');
const consola = require('consola');
const Config = require('webpack-chain');
const vue = require('@vitejs/plugin-vue')


const defaults = {};

const BUILD_TEMPLATE = '@nuxt/nuxt-vuenext-app';

module.exports = function (userOptions) {
  const { nuxt } = this

  if (nuxt.options.mode !== 'spa' && nuxt.options.ssr) {
    return
  }

  this.nuxt.hook('vite:extendConfig', function (clientConfig) {
    const plugins = clientConfig.plugins.filter(plugin => plugin.name !=='vite-plugin-vue2')
    const ishas = plugins.find(plugin => plugin.name ==='vite:vue')
    !ishas && plugins.push(vue())
    clientConfig.plugins = plugins
  });

  this.nuxt.hook('ready', function (nuxt) {
    nuxt.options.build.template = BUILD_TEMPLATE;
  });

  this.nuxt.hook('webpack:config', function (webpackConfigs) {
    const chainWebpack = new Config();
    chainWebpack.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
      .loader(require.resolve('vue-loader-v16'))
      .options({
        babelParserPlugins: ['jsx', 'classProperties', 'decorators-legacy'],
      })
      .end()
      .end();

    chainWebpack
      .plugin('vue-loader')
      .use(require('vue-loader-v16').VueLoaderPlugin);

    const VueLoader = webpackConfigs[0].module.rules.findIndex((loader) =>
      loader.test.test('.vue'),
    );

    webpackConfigs[0].module.rules.splice(
      VueLoader,
      1,
      chainWebpack.toConfig().module.rules[0],
    );

    const VuePlugin = webpackConfigs[0].plugins.findIndex(
      (plugin) => plugin.constructor.name === 'VueLoaderPlugin',
    );

    webpackConfigs[0].plugins.splice(
      VuePlugin,
      1,
      chainWebpack.toConfig().plugins[0],
    );

    return webpackConfigs;
  });
};
