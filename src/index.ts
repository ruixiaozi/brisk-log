import { Logger } from '@core';
import { LoggerOption } from '@interface';

// 接口
export * from '@interface';

// 核心
export * from '@core';

// 装饰器
export * from '@decorator';

/**
 * Brisk-IoC
 * License MIT
 * Copyright (c) 2022 Ruixiaozi
 * admin@ruixiaozi.com
 * https://github.com/ruixiaozi/brisk-log
 */
class _BriskLog {

  /**
   * config 配置日志
   * @param option 日志选项
   * @returns
   */
  config(option: LoggerOption): _BriskLog {
    Logger.config(option);
    return this;
  }

  /**
   * getLogger 获取日志实例
   * @param region 日志域
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  getLogger(region?: symbol): Logger {
    return Logger.getInstance(region);
  }

}


export const BriskLog = new _BriskLog();
