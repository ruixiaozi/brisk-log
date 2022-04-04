import { BriskLog } from 'brisk-log';
import { LOG_CONFIG } from './log.config';

BriskLog.config(LOG_CONFIG);

const logger = BriskLog.getLogger();

const loggerTest = BriskLog.getLogger(Symbol('test'));

logger.debug('gloal debug');
logger.info('global info');
logger.warn('global warn');
logger.error('global error');


loggerTest.debug('test debug');
loggerTest.info('test info');
loggerTest.warn('test warn');
loggerTest.error('test error');
