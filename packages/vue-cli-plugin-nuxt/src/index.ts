const assetsDir = 'static';

import initServeCommand from './commands/serve';
import vueConfig from './lib/vueConfig';

module.exports = (
  api: {
    configureWebpack: any;
    chainWebpack: any;
  },
  options: { pages: any },
) => {
  initServeCommand(api, options);
  Object.assign(
    options,
    {
      assetsDir,
    },
    vueConfig,
  );

  api.configureWebpack(vueConfig);
};
