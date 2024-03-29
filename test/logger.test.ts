import { configure, getLogger, LOGGER_LEVEL_E } from '../src/core/logger';

import * as winston from 'winston';

jest.mock('winston', () => {
  const originalModule = jest.requireActual('winston');
  return {
    __esModule: true,
    ...originalModule,
    transports: {
      Console: class {
        name = 'Console';
        constructor(option: any) {}
      },
      DailyRotateFile: class {
        name = 'DailyRotateFile';
        constructor(option: any) {}
      }
    },
  };
});

describe('logger', () => {

  const winstonLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    configure: jest.fn(),
  }

  beforeEach(() => {
    jest.spyOn(winston, 'createLogger').mockReturnValue(winstonLogger as any);
  })

  // option 应该返回默认配置，当没有手动配置日志选项时
  test('option Should return default configuration When has not custom configure', () => {
    const logger = getLogger();
    expect(logger.option.level).toEqual(LOGGER_LEVEL_E.debug);
    expect(logger.option.format({
      level: LOGGER_LEVEL_E[LOGGER_LEVEL_E.debug],
      message: 'test',
      timeStr: '2022-01-01 00:00:00',
      region: logger.region.description,
    })).toEqual('[debug]: 2022-01-01 00:00:00 [global]test');
    expect(logger.option.enableConsole).toEqual(true);
    expect(logger.option.enableFile).toEqual(false);
    expect(logger.option.filePath).toEqual('logs');
    expect(logger.option.fileMaxSize).toEqual('20m');
    expect(logger.option.fileMaxDate).toEqual('30d');
  });

  // getLogger 应该返回region和namespace都为gloabl的日志实例，当没有参数时
  test('getLogger Should return a global logger instance When has no parameter', () => {
    const logger = getLogger();
    const logger2 = getLogger();
    expect(logger.region.description).toEqual('global');
    expect(logger.namespace.description).toEqual('global');
    expect(logger).toEqual(logger2);
  });

  // getLogger 应该返回具有相同配置的logger实例，当他们的namespace相同时
  test('getLogger Should return same configuration logger instance When same namespace and not same region', () => {
    const namespace = Symbol('test');
    const logger = getLogger(Symbol('region1'), namespace);
    configure({
      level: LOGGER_LEVEL_E.info,
      enableFile: true,
    }, namespace);
    const logger2 = getLogger(Symbol('region2'), namespace);
    expect(logger.namespace).toEqual(logger2.namespace);
    expect(logger.option.level).toEqual(LOGGER_LEVEL_E.info);
    expect(logger.option.level).toEqual(logger2.option.level);
  });

   // instance.configure 应该改变当前实例的配置，不影响其他同命名空间的实例，当调用实例自身的configure
   test('configure Should change current instance configuration and not change namespace\'s other instance When call instance self configure', () => {
    const namespace = Symbol('test');
    configure({
      level: LOGGER_LEVEL_E.info,
      enableFile: true,
    }, namespace);
    const logger = getLogger(Symbol('region1'), namespace);
    const logger2 = getLogger(Symbol('region2'), namespace);
    logger2.configure({
      level: LOGGER_LEVEL_E.error,
    })
    const logger3 = getLogger(Symbol('region3'), namespace);
    expect(logger.option.level).toEqual(LOGGER_LEVEL_E.info);
    expect(logger2.option.level).toEqual(LOGGER_LEVEL_E.error);
    expect(logger3.option.level).toEqual(LOGGER_LEVEL_E.info);
  });

  // configure 应该改变global命名空间下的日志配置，当调用configure不带命名空间时
  test('configure Should change global namespace configuration When call configure without namespace', () => {
    const logger = getLogger();
    configure({
      level: LOGGER_LEVEL_E.error
    });
    const logger2 = getLogger();
    expect(logger.option.level).toEqual(LOGGER_LEVEL_E.error);
    expect(logger2.option.level).toEqual(LOGGER_LEVEL_E.error);
  });

  // logger实例 应该正确调用debug及以上级别日志打印，当他们的配置的level为debug
  test('logger instance Should call all upper debug level When option level is debug', () => {
    const logger = getLogger();
    logger.configure({
      level: LOGGER_LEVEL_E.debug
    })
    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    expect(winstonLogger.debug).toHaveBeenCalledWith('debug');
    expect(winstonLogger.info).toHaveBeenCalledWith('info');
    expect(winstonLogger.warn).toHaveBeenCalledWith('warn');
    expect(winstonLogger.error).toHaveBeenCalledWith('error');
  });

  // logger实例 应该正确调用info及以上级别日志打印，当他们的配置的level为info
  test('logger instance Should call all upper info level When option level is info', () => {
    const logger = getLogger();
    logger.configure({
      level: LOGGER_LEVEL_E.info
    })
    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    expect(winstonLogger.debug).not.toBeCalled();
    expect(winstonLogger.info).toHaveBeenCalledWith('info');
    expect(winstonLogger.warn).toHaveBeenCalledWith('warn');
    expect(winstonLogger.error).toHaveBeenCalledWith('error');
  });

  // logger实例 应该正确调用warn及以上级别日志打印，当他们的配置的level为warn
  test('logger instance Should call all upper warn level When option level is warn', () => {
    const logger = getLogger();
    logger.configure({
      level: LOGGER_LEVEL_E.warn
    })
    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    expect(winstonLogger.debug).not.toBeCalled();
    expect(winstonLogger.info).not.toBeCalled();
    expect(winstonLogger.warn).toHaveBeenCalledWith('warn');
    expect(winstonLogger.error).toHaveBeenCalledWith('error');
  });

  // logger实例 应该正确调用error及以上级别日志打印，当他们的配置的level为error
  test('logger instance Should call all upper error level When option level is error', () => {
    const logger = getLogger();
    logger.configure({
      level: LOGGER_LEVEL_E.error
    })
    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    expect(winstonLogger.debug).not.toBeCalled();
    expect(winstonLogger.info).not.toBeCalled();
    expect(winstonLogger.warn).not.toBeCalled();
    expect(winstonLogger.error).toHaveBeenCalledWith('error');
  });

  // logger实例的日志方法 应该输出json的序列号字符串，当传入了meta参数
  test('logger log function Should output json stringify When call with metas', () => {
    const logger = getLogger();
    logger.configure({
      level: LOGGER_LEVEL_E.debug
    })
    logger.debug('debug', 'test');
    logger.info('info', 'test', 'test1');
    logger.warn('warn', 'test', { a: 1 });
    logger.error('error', 123);
    expect(winstonLogger.debug).toHaveBeenCalledWith(`debug\n'test'`);
    expect(winstonLogger.info).toHaveBeenCalledWith(`info\n'test'\n'test1'`);
    expect(winstonLogger.warn).toHaveBeenCalledWith(`warn\n'test'\n{ a: 1 }`);
    expect(winstonLogger.error).toHaveBeenCalledWith(`error\n123`);
  });


});
