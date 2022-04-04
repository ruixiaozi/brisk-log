import { LogMsg, LoggerOption } from 'brisk-log';

const multiLogFileConfig = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
};
// 配置日志参数

export const LOG_CONFIG: LoggerOption = {
  formatFnc(logMsg: LogMsg) {
    return `[${logMsg.level}]: ${logMsg.timeStr}\t[${logMsg.region}] ${logMsg.message.substring(1)}`;
  },
  fileConfigs: [
    {
      path: 'logs/info-%DATE%.log',
      level: 'info',
      ...multiLogFileConfig,
    },
    {
      path: 'logs/warn-%DATE%.log',
      level: 'warn',
      ...multiLogFileConfig,
    },
    {
      path: 'logs/err-%DATE%.log',
      level: 'err',
      ...multiLogFileConfig,
    },
  ],
  consoleConfig: {
    enable: true,
    level: 'debug',
  },
  isDebug: false,
  isMultiFile: true,
};
