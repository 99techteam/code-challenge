import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'dev';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  base: {
    env: process.env.NODE_ENV || 'prod',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;