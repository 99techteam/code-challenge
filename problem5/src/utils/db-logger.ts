import winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, label, printf } = format;

const logFormat = printf(({
  level, message, label, timestamp
}) => `${timestamp} [${label}] ${level}: ${message}`);

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'db_logfile.log' })
  ],
  format: combine(
    label({ label: 'DB' }),
    timestamp(),
    logFormat
  )
})

export default logger;