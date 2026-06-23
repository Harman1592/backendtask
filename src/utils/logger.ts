import { config } from '@config/index.js';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private isDevelopment = config.isDevelopment;
  private logLevel = config.logLevel as LogLevel;

  private shouldLog(level: LogLevel): boolean {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const msg = `${prefix} ${message}`;
    return data ? `${msg} ${JSON.stringify(data)}` : msg;
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, error));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.format('info', message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', message, data));
    }
  }
}

export const logger = new Logger();
