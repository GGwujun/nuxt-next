import { chalk, yParser } from '@umijs/utils';
import { Service } from './ServiceWithBuiltIn';
import fork from './utils/fork';
import getCwd from './utils/getCwd';
import getPkg from './utils/getPkg';

// process.argv: [node, umi.js, command, args]
const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});

export default async (command: any) => {
  try {
    if (command === 'dev') {
      const child = fork({
        scriptPath: require.resolve('./forkedDev'),
      });
      // ref:
      // http://nodejs.cn/api/process/signal_events.html
      process.on('SIGINT', () => {
        child.kill('SIGINT');
        process.exit(1);
      });
      process.on('SIGTERM', () => {
        child.kill('SIGTERM');
        process.exit(1);
      });
    } else {
      if (command === 'build') {
        process.env.NODE_ENV = 'production';
      }
      await new Service({
        cwd: getCwd(),
        pkg: getPkg(process.cwd()),
        //@ts-ignore
      }).run({
        name: command,
        args: args,
      });
    }
  } catch (e) {
    console.error(chalk.red(e.message));
    console.error(e.stack);
    process.exit(1);
  }
};
