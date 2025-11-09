import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define log format
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),

  // Add colors in development
  process.env.NODE_ENV === 'development'
    ? winston.format.colorize({ all: true })
    : winston.format.uncolorize(),

  // Define format for each log
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports: winston.transport[] = [];

// Console transport - disabled in test environment
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    })
  );
}

// Add file transports (enabled by default, disable with ENABLE_FILE_LOGGING=false)
if (process.env.ENABLE_FILE_LOGGING !== 'false') {
  // Create logs directory path
  const logsDir = path.join(process.cwd(), 'logs');

  // Error logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );

  // Combined logs (all levels) - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );

  // HTTP logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d', // Keep HTTP logs for 7 days
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Create a stream object for Morgan integration
export const logStream = {
  write: (message: string) => {
    // Morgan adds a newline, so we trim it
    logger.http(message.trim());
  },
};

export default logger;
