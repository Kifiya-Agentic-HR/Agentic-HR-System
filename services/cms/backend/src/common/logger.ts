import * as winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  dirname: require('path').resolve(__dirname, '../../logs/cms-backend'),  filename: 'backend-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '14d', // keep logs for 14 days
  level: 'info',
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    )
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});