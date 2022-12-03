import { configure, getConfiguration, getLogger, Log, Logger, LOGGER_LEVEL_E } from 'brisk-log';

console.log(getConfiguration());

getLogger().configure({
  level: LOGGER_LEVEL_E.info,
  enableFile: true,
});
class Test1 {
  @Log()
  logger!: Logger;
}

const test1 = new Test1();
test1.logger.debug('test debug')
test1.logger.info('test info');
test1.logger.warn('test warn');
test1.logger.error('test error');

const myNamespace = Symbol('myNamespace');
const myRegion1 = Symbol('myRegion1');

configure({
  level: LOGGER_LEVEL_E.error
}, myNamespace);

const myLogger1 = getLogger(myRegion1, myNamespace);

console.log(myLogger1.option);

configure({
  level: LOGGER_LEVEL_E.debug,
  enableFile: true,
});
const logger = getLogger();
logger.debug('test debug', 'meta1', { name: 'jone' });
