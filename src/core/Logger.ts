import { createLogger, format, transports, Logger as _Logger } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

export enum LOGGER_LEVEL_E {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3,
}

export interface LoggerMsg{
  level: string;
  timeStr: string;
  message: string;
  region?: string;
}

export interface LoggerOption {
  // 默认DEBUG
  level?: LOGGER_LEVEL_E;
  // 默认 `[${msg.level}]: ${msg.timeStr} [${msg.region}]${msg.message}`
  format?: (msg: LoggerMsg) => string;
  // 是否开启控制台日志，默认true
  enableConsole?: boolean;
  // 是否开启文件日志，默认false
  enableFile?: boolean;
  // 指定文件日志的相对项目的执行路径，默认为logs
  filePath?: string;
  // 文件最大尺寸，默认20m
  fileMaxSize?: string;
  // 文件最大保留时间，默认30d
  fileMaxDate?: string;
}

export interface LoggerOptionActual extends LoggerOption {
  level: LOGGER_LEVEL_E;
  format: (msg: LoggerMsg) => string;
  enableConsole: boolean;
  enableFile: boolean;
  filePath: string;
  fileMaxSize: string;
  fileMaxDate: string;
}

export interface Logger {
  get region(): symbol;
  get namespace(): symbol;
  get option(): LoggerOptionActual;
  configure(option: LoggerOption): void;
  debug(message: string, ...meta: any[]): Logger;
  info(message: string, ...meta: any[]): Logger;
  warn(message: string, ...meta: any[]): Logger;
  error(message: string, ...meta: any[]): Logger;
}

const globalNamespaceSymbol = Symbol('global');

const globalRegionSymbol = Symbol('global');

const namespaceConfig: { [key: symbol]: LoggerOptionActual } = {};

const defaultConfig: LoggerOptionActual = {
  level: LOGGER_LEVEL_E.debug,
  format: (msg: LoggerMsg) => `[${msg.level}]: ${msg.timeStr} [${msg.region}]${msg.message}`,
  enableConsole: true,
  enableFile: false,
  filePath: 'logs',
  fileMaxSize: '20m',
  fileMaxDate: '30d',
};

/**
 * 获取命名空间的日志配置
 * @param namespace
 * @returns
 */
export function getConfiguration(namespace: symbol = globalNamespaceSymbol): LoggerOptionActual {
  let config = namespaceConfig[namespace];
  if (config) {
    return config;
  }
  config = { ...defaultConfig };
  namespaceConfig[namespace] = config;
  return config;
}


/**
 * 名称
 * @description 日志核心类
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年12月02日
 * @since 0.0.1
 */
class LoggerImpl implements Logger {

  // winston日志实例
  private _logger: _Logger;

  private _region: symbol;

  private _namespace: symbol;

  // 当前实例的配置选项
  private _option: LoggerOptionActual;

  get region(): symbol {
    return this._region;
  }

  get namespace(): symbol {
    return this._namespace;
  }

  get option(): LoggerOptionActual {
    return this._option;
  }

  /**
   * 构造方法
   */
  constructor(region: symbol, namespace: symbol) {
    // 默认使用命名空间的全局配置
    this._option = { ...getConfiguration(namespace) };
    this._logger = createLogger(this.generateWinstonOption());
    this._region = region;
    this._namespace = namespace;
  }

  /**
   * 单独配置当前实例
   * @param option
   */
  configure(option: LoggerOption): void {
    this._option = { ...defaultConfig };
    Object.entries(option).forEach(([key, value]) => {
      (this._option as any)[key] = value;
    });
    this._logger.configure(this.generateWinstonOption());
  }

  /**
   * 生成Winston日志选项
   * @param option
   * @returns
   */
  private generateWinstonOption() {
    const logTransports = [];
    if (this._option.enableConsole) {
      logTransports.push(new transports.Console({
        level: LOGGER_LEVEL_E[this._option.level],
      }));
    }
    if (this._option.enableFile) {
      for (let { level } = this._option; level <= LOGGER_LEVEL_E.error; level++) {
        logTransports.push(new transports.DailyRotateFile({
          level: LOGGER_LEVEL_E[level],
          filename: path.join(this._option.filePath, `${LOGGER_LEVEL_E[level]}-%DATE%.log`),
          datePattern: 'YYYY-MM-DD',
          // true
          zippedArchive: true,
          // '20m'
          maxSize: this._option.fileMaxSize,
          // '30d'
          maxFiles: this._option.fileMaxDate,
        }));
      }
    }
    return {
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.align(),
        format.printf((info) => this._option.format({
          level: info.level,
          message: info.message,
          timeStr: info.timestamp,
          region: this._region?.description || '',
        })),
      ),
      transports: logTransports,
    };
  }

  /**
   * debug日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public debug(message: string, ...meta: any[]): Logger {
    this._option.level <= LOGGER_LEVEL_E.debug && this._logger.debug(this._formatMessage(message, meta));
    return this;
  }

  /**
   * info日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public info(message: string, ...meta: any[]): Logger {
    this._option.level <= LOGGER_LEVEL_E.info && this._logger.info(this._formatMessage(message, meta));
    return this;
  }

  /**
   * warn日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public warn(message: string, ...meta: any[]): Logger {
    this._option.level <= LOGGER_LEVEL_E.warn && this._logger.warn(this._formatMessage(message, meta));
    return this;
  }

  /**
   * error日志
   * @param message 日志信息
   * @param meta 其他元素
   * @returns 日志实例
   */
  public error(message: string, ...meta: any[]): Logger {
    this._option.level <= LOGGER_LEVEL_E.error && this._logger.error(this._formatMessage(message, meta));
    return this;
  }

  private _formatMessage(message: string, meta: any[] = []): string {
    return meta.length > 0 ? `${message}\n${JSON.stringify(meta, undefined, 2)}` : message;
  }

}

// 日志实例（单例）
const instances: { [key: symbol]: { [key: symbol]: Logger} } = {};

function getNamespceLoggers(namespace: symbol): { [key: symbol]: Logger} {
  let loggers = instances[namespace];
  if (loggers) {
    return loggers;
  }
  instances[namespace] = {};
  return instances[namespace];
}

/**
 * 获取日志实例
 * @param region 日志域
 * @param namespace 日志的命名空间
 * @returns
 */
export function getLogger(region: symbol = globalRegionSymbol, namespace: symbol = globalNamespaceSymbol) {
  const namespaceLoggers = getNamespceLoggers(namespace);
  let instance = namespaceLoggers[region];
  if (instance) {
    return instance;
  }
  instance = new LoggerImpl(region, namespace);
  namespaceLoggers[region] = instance;
  return instance;
}

/**
 * 配置全局命名空间的日志选项
 * @param option
 * @param namespace
 */
export function configure(option: LoggerOption, namespace: symbol = globalNamespaceSymbol) {
  const config = getConfiguration(namespace);
  Object.entries(option).forEach(([key, value]) => {
    if (value) {
      (config as any)[key] = value;
    }
  });
  // 需要将已存在的日志实例选项重新配置
  const namespaceLoggers = getNamespceLoggers(namespace);
  Object.getOwnPropertySymbols(namespaceLoggers).forEach((key) => {
    namespaceLoggers[key].configure(config);
  });
}
