const { resolve, join, basename } = require('path');
const { readdirSync } = require('fs');
const consola = require('consola');

const logger = consola.withScope('@tzfe/nuxt:auth');

const defaults = {
  // 启用多版本部署
  // enableMultiVersion: false,
  localLogin: false,
  loginUrl: '/login',
  rbacUrl: '',
  accessField: 'auths',
  isLocal: process.env.NODE_ENV !== 'production',
  auto: true,
  loginCallBack: 'loginSuccess',
};

const ROOT_DIR = 'nuxt-auth';
const PLUGINS_DIR = 'plugins/';
const TEMPLATES_DIR = 'templates/';

module.exports = function (userOptions) {
  const pluginsPath = join(__dirname, PLUGINS_DIR);
  const templatesPath = join(__dirname, TEMPLATES_DIR);

  const requiredPlugins = ['store', 'router'];

  const options = {
    ...defaults,
    ...userOptions,
    ...this.options.auth,
    TZ_ENV: this.options.env.TZ_ENV || 'DEV',
  };

  if (!options.udbOrigin) {
    options.udbOrigin = `https://open${
      options.TZ_ENV === 'prod' ? '' : `-${options.TZ_ENV}`
    }.shiguangkey.com/api`;
  }

  if (!options.loginOrigin) {
    options.loginOrigin = `https://iwork${
      options.TZ_ENV === 'prod' ? '' : `-${options.TZ_ENV}`
    }.shiguangkey.com/login?redirect=http://${this.options.server.host}:${
      this.options.server.port
    }`;
  }

  // if (options.enableMultiVersion && typeof this.options.env.NUXT_ENV_VERSION !== "undefined") {
  //   options.loginOrigin = `${options.loginOrigin}/_${this.options.env.NUXT_ENV_VERSION}/`;
  // }

  if (!options.rbacUrl) {
    logger.error(
      `鉴权模块需要传获取权限标识的接口,你现在传的是${options.rbacUrl}`,
    );
  }

  if (!options.userInfoUrl) {
    options.userInfoUrl = `https://organization${
      options.TZ_ENV === 'prod' ? '' : `-${options.TZ_ENV}`
    }.shiguangkey.com/api/organization/login/getUserInfo`;
  }

  if (options.prepare) {
    options.prepare = options.prepare.map((plugin) => {
      const file = this.nuxt.resolver.resolvePath(plugin);
      return {
        name: basename(file),
        src: file,
      };
    });
    // Templates
    for (const plugin of options.prepare) {
      this.addTemplate({
        src: plugin.src,
        fileName: join(ROOT_DIR, plugin.name),
        options,
      });
    }
  }

  if (options.access) {
    options.access = options.access.map((plugin) => {
      const file = this.nuxt.resolver.resolvePath(plugin);
      return {
        name: basename(file),
        src: file,
      };
    });
    // Templates
    for (const plugin of options.access) {
      this.addTemplate({
        src: plugin.src,
        fileName: join(ROOT_DIR, plugin.name),
        options,
      });
    }
  }

  // Plugins
  for (const file of requiredPlugins) {
    this.addPlugin({
      src: resolve(pluginsPath, `${file}.js`),
      fileName: join(ROOT_DIR, `plugin.${file}.js`),
      options,
      mode: 'client',
    });
  }

  // Templates
  for (const file of readdirSync(templatesPath)) {
    this.addTemplate({
      src: resolve(templatesPath, file),
      fileName: join(ROOT_DIR, file),
      options,
    });
  }

  /**
   * @auto default true
   * 默认情况下,把 auth 自动添加为路由中间件
   * 提供一个开关主要目的, 提供灵活性. 给用户自主控制中间件执行顺序.
   * 目前 this.options.router.middleware.push("auth") 是取 ``nuxt.config.js`` 中的 ``router`` 配置
   * 中 middleware 配置，模块是在编译时,也就是它永远是添加在中间件列表最后.  假如某些中间件依赖 auth 后的数据就很难灵活做到.
   */
  if (options.auto) {
    this.options.router.middleware.push('auth');
  }
};
