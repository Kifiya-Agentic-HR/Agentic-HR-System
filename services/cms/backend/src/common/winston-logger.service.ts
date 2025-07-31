import { LoggerService } from '@nestjs/common';
import { logger as winstonLogger } from './logger';

export class WinstonLoggerService implements LoggerService {
  log(message: string, context?: string) {
    winstonLogger.info(context ? `[${context}] ${message}` : message);
  }
  error(message: string, trace?: string, context?: string) {
    winstonLogger.error(
      context ? `[${context}] ${message}` : message,
      trace ? { trace } : undefined,
    );
  }
  warn(message: string, context?: string) {
    winstonLogger.warn(context ? `[${context}] ${message}` : message);
  }
  debug?(message: string, context?: string) {
    winstonLogger.debug(context ? `[${context}] ${message}` : message);
  }
  verbose?(message: string, context?: string) {
    winstonLogger.verbose(context ? `[${context}] ${message}` : message);
  }
}