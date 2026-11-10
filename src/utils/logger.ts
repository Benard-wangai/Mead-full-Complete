// src/utils/logger.ts
// Professional Logger for Mead - The Global Luxury Super App
// Feature-tagged logging with colors, levels, timestamps, and safe debugging
// Fully typed and error-free - works perfectly with api.ts, storage.ts, pushNotifications.ts, etc.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  screen?: string;
  feature?: string;
}

class MeadLogger {
  // eslint-disable-next-line no-undef
  private readonly isDebugMode = __DEV__;

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(
    level: LogLevel, 
    message: string, 
    data?: any, 
    screen?: string, 
    feature?: string
  ): LogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      message,
      data: data !== undefined ? (typeof data === 'object' ? { ...data } : data) : undefined,
      screen,
      feature,
    };
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return '#666666';
      case 'info':  return '#00BFFF';
      case 'warn':  return '#FFD700';
      case 'error': return '#FF4500';
      default:      return '#FFFFFF';
    }
  }

  private consoleLog(level: LogLevel, entry: LogEntry): void {
    const color = this.getColor(level);

    console.log(
      `%c( {prefix} %c ){entry.message}`,
      `color: ${color}; font-weight: bold;`,
      'color: inherit;'
    );

    if (entry.data !== undefined) {
      console.log('%cData →', 'color: #888888; font-weight: 500;', entry.data);
    }
    if (entry.screen) {
      console.log('%cScreen →', 'color: #888888;', entry.screen);
    }
    if (entry.feature) {
      console.log('%cFeature →', 'color: #888888;', entry.feature);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Core Logging Methods
  // ─────────────────────────────────────────────────────────────────────────────

  debug(message: string, data?: any, screen?: string, feature?: string): void {
    if (!this.isDebugMode) return;
    const entry = this.formatLog('debug', message, data, screen, feature);
    this.consoleLog('debug', entry);
  }

  info(message: string, data?: any, screen?: string, feature?: string): void {
    const entry = this.formatLog('info', message, data, screen, feature);
    this.consoleLog('info', entry);
  }

  warn(message: string, data?: any, screen?: string, feature?: string): void {
    const entry = this.formatLog('warn', message, data, screen, feature);
    this.consoleLog('warn', entry);
  }

  error(message: string, errorOrData?: any, screen?: string, feature?: string): void {
    const entry = this.formatLog('error', message, errorOrData, screen, feature);
    this.consoleLog('error', entry);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Feature-specific shortcuts (very useful for debugging)
  // ─────────────────────────────────────────────────────────────────────────────

  brew(message: string, data?: any): void {
    this.info(message, data, 'Brews', 'Brew');
  }

  ai(message: string, data?: any): void {
    this.info(message, data, 'MeadAI', 'AI');
  }

  call(message: string, data?: any): void {
    this.info(message, data, 'Calls', 'Call');
  }

  payment(message: string, data?: any): void {
    this.info(message, data, 'Payments', 'Payment');
  }

  marketplace(message: string, data?: any): void {
    this.info(message, data, 'Marketplace', 'Marketplace');
  }

  notification(message: string, data?: any): void {
    this.info(message, data, 'Notifications', 'Push');
  }

  offline(message: string, data?: any): void {
    this.warn(message, data, 'Offline', 'Queue');
  }

  auth(message: string, data?: any): void {
    this.info(message, data, 'Auth', 'Auth');
  }

  // Utility to clear console in development
  clear(): void {
    if (this.isDebugMode) {
      console.clear();
    }
  }
}

// Export singleton instance
export const meadLogger = new MeadLogger();
export default meadLogger;