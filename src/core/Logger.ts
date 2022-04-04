import { LoggerOption, LogMsg } from '@interface';
import { createLogger, format, transports, Logger as _Logger, LoggerOptions } from 'winston';
import 'winston-daily-rotate-file';
import TransportStream from 'winston-transport';

/**
 * 名称
 * @description 日志核心类
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年04月03日 18:21:41
 * @version 1.0.0
 */
export class Logger {

  // 日志实例（单例）
  static #instances: Map<symbol, Logger> = new Map<symbol, Logger>();

  // 必须要开启debug，debug才有效, 默认关闭
  static #isDebug = false;

  // 自定义日志格式
  static #customFormat = {
    time: format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align: format.align(),
    color: format.colorize(),
  };

  static #formatFnc = (logMsg: LogMsg) => `[${logMsg.level}]: ${logMsg.timeStr} [${logMsg.region}]${logMsg.message}`;

  // 自定义日志配置, 不配置则只有console
  static #customCofing: TransportStream[] = [
    new transports.Console({
      level: 'info',
    }),
  ];

  /**
   * 获取日志实例
   * @param option 自定义的日志选项
   * @returns 日志实例
   */
  public static getInstance(region?: symbol) {
    const _region = region || Symbol('global');
    const option = {
      format: format.combine(
        ...Object.values(Logger.#customFormat),
        format.printf((info) => Logger.#formatFnc({
          level: info.level,
          message: info.message,
          timeStr: info.timestamp,
          region: _region.description,
        })),
      ),
      transports: Logger.#customCofing,
    };
    let instance = Logger.#instances.get(_region);
    if (instance) {
      instance.#configure(option);
    } else {
      instance = new Logger(option);
      Logger.#instances.set(_region, instance);
    }
    instance.#region = _region;
    return instance;
  }

  public static config(option: LoggerOption) {
    Logger.#formatFnc = option.formatFnc;
    if (option.isMultiFile) {
      Logger.#customCofing = option.fileConfigs.map((config) => new transports.DailyRotateFile({
        level: config.level,
        filename: config.path,
        datePattern: config.datePattern ?? 'YYYY-MM-DD',
        // true
        zippedArchive: config.zippedArchive ?? true,
        // '20m'
        maxSize: config.maxSize ?? '20m',
        // '30d'
        maxFiles: config.maxFiles ?? '30d',
      }));
    } else {
      Logger.#customCofing = option.fileConfigs.map((config) => new transports.File({
        level: config.level,
        filename: config.path,
      }));
    }

    if (option.consoleConfig.enable) {
      Logger.#customCofing.push(new transports.Console({
        level: option.consoleConfig.level,
      }));
    }

    if (option.isDebug !== undefined) {
      Logger.#isDebug = option.isDebug;
    }

    for (let [, instance] of Logger.#instances) {
      instance.#configure({
        format: format.combine(
          ...Object.values(Logger.#customFormat),
          format.printf((info) => Logger.#formatFnc({
            level: info.level,
            message: info.message,
            timeStr: info.timestamp,
            region: instance.#region?.description || '',
          })),
        ),
        transports: Logger.#customCofing,
      });
    }
  }

  // winston日志实例
  #logger: _Logger;

  #region?: symbol;

  // eslint-disable-next-line class-methods-use-this
  get isDebug(): boolean {
    return Logger.#isDebug;
  }

  // 修改实例的isDebug将影响全局isDebug
  // eslint-disable-next-line class-methods-use-this
  set isDebug(value: boolean) {
    Logger.#isDebug = value;
  }


  /**
   * 构造方法
   * @param option 日志选项
   */
  constructor(option: LoggerOptions) {
    this.#logger = createLogger(option);
  }

  /**
   * 重新配置
   * @param option 日志选项
   */
  #configure(option: LoggerOptions) {
    this.#logger.configure(option);
  }


  /**
   * debug日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public debug(message: string, ...meta: any[]) {
    Logger.#isDebug && this.#logger.debug(message, ...meta);
    return this;
  }

  /**
   * info日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public info(message: string, ...meta: any[]) {
    this.#logger.info(message, ...meta);
    return this;
  }

  /**
   * warn日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public warn(message: string, ...meta: any[]) {
    this.#logger.warn(message, ...meta);
    return this;
  }

  /**
   * error日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public error(message: string, ...meta: any[]) {
    this.#logger.error(message, ...meta);
    return this;
  }

}
