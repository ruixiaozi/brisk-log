// 日志信息接口
export interface LogMsg{
  level: string;
  timeStr: string;
  message: string;
  region?: string;
}

// 日志文件输出配置
export interface FileConfig{
  // "logs/info-%DATE%.log",
  path: string;
  level: string;
  // datePattern: "YYYY-MM-DD"
  datePattern?: string;
  // true
  zippedArchive?: boolean;
  // '20m'
  maxSize?: string;
  // '30d'
  maxFiles?: string;
}

// 日志控制台输出配置
export interface ConsoleConfig{
  enable: boolean;
  level: string;
}

// 日志格式化方法
export type FormatFnction = (logMsg: LogMsg)=>string;

/**
 * LoggerOption
 * @description 日志选项接口
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年04月04日 20:31:28
 * @version 1.0.0
 */
export interface LoggerOption{
  formatFnc: FormatFnction;
  fileConfigs: FileConfig[];
  consoleConfig: ConsoleConfig;
  isDebug?: boolean;
  isMultiFile?: boolean;
}
