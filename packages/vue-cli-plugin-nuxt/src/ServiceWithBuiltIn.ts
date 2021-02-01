import { dirname } from 'path';
import { IServiceOpts, Service as CoreService } from '@nuxt/core';

class Service extends CoreService {
  constructor(opts: IServiceOpts) {
    process.env.UMI_VERSION = require('../package').version;
    process.env.UMI_DIR = dirname(require.resolve('../package'));

    super({
      ...opts,
      presets: [require.resolve('@nuxt/preset-built-in')],
    });
  }
}

export { Service };
