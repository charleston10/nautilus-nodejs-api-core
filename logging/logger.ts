import { configure, getLogger } from 'log4js';

export default () => {
  configure({
    appenders: {
      out: { type: 'console' },
      task: { type: 'dateFile', filename: 'logs/task', "pattern": "-yyyy-MM-dd.log", alwaysIncludePattern: true },
      result: { type: 'dateFile', filename: 'logs/result', "pattern": "-yyyy-MM-dd.log", alwaysIncludePattern: true },
      error: { type: 'dateFile', filename: 'logs/error', "pattern": "-yyyy-MM-dd.log", alwaysIncludePattern: true },
      default: { type: 'dateFile', filename: 'logs/default', "pattern": "-yyyy-MM-dd.log", alwaysIncludePattern: true },
      rate: { type: 'dateFile', filename: 'logs/rate', "pattern": "-yyyy-MM-dd.log", alwaysIncludePattern: true }
    },
    categories: {
      default: { appenders: ['out', 'default'], level: 'info' },
      task: { appenders: ['task'], level: 'info' },
      result: { appenders: ['result'], level: 'info' },
      error: { appenders: ['error'], level: 'error' },
      rate: { appenders: ['rate'], level: 'info' }
    }
  });

  return getLogger();
}