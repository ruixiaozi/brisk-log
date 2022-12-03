import { Log } from '../src/decorator/index'
import * as winston from 'winston';
import { Logger } from '../src/core/logger';

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

describe('decorator', () => {

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

  // Log装饰器 应该注入一个logger实例，当将它用在一个属性上
  test('Log decorator Should inject a logger instance When use it in property', () => {
    class Test1 {
      @Log()
      logger!: Logger;
    }

    const test1 = new Test1();
    test1.logger.error('test error')

    expect(winstonLogger.error).toHaveBeenCalledWith('test error');
  });

});
