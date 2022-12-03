import { getLogger, Log, Logger, LOGGER_LEVEL_E } from 'brisk-log';

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
