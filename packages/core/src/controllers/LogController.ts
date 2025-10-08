import { proxy } from 'valtio';
import { OptionsController } from './OptionsController';
import { sanitizeString, sanitizeStackTrace, sanitizeValue, sanitizeData } from '../utils/LogUtils';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';

// -- Types --------------------------------------------- //
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  fileName?: string;
  functionName?: string;
  data?: Record<string, unknown>;
}

export interface LogControllerState {
  logs: LogEntry[];
}

// -- Constants ----------------------------------------- //
const MAX_LOGS_COUNT = 300; // Prevent memory issues

// -- State --------------------------------------------- //
const state = proxy<LogControllerState>({
  logs: []
});

const generateLogId = (): string => {
  return CoreHelperUtil.getUUID();
};

const logToConsole = (entry: LogEntry) => {
  const { debug } = OptionsController.state;

  if (!debug) {
    return;
  }

  const location =
    entry.fileName && entry.functionName
      ? `[${entry.fileName}:${entry.functionName}]`
      : entry.fileName
      ? `[${entry.fileName}]`
      : '';

  const logMessage = `[AppKit] ${location} ${entry.message}`;

  switch (entry.level) {
    case 'error':
      // eslint-disable-next-line no-console
      console.error(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(logMessage);
      break;
    case 'info':
    default:
      // eslint-disable-next-line no-console
      console.log(logMessage);
      break;
  }
};

// -- Controller ---------------------------------------- //
export const LogController = {
  state,

  /**
   * Destroy the LogController (cleanup resources)
   */
  destroy() {
    // Clear all logs
    state.logs = [];
  },

  /**
   * Send a general log entry
   */
  sendLog(
    level: LogLevel,
    message: string,
    fileName?: string,
    functionName?: string,
    data?: Record<string, unknown>
  ) {
    if (!OptionsController.state.debug) {
      return;
    }
    const entry: LogEntry = {
      id: generateLogId(),
      timestamp: Date.now(),
      level,
      message: sanitizeString(message),
      fileName,
      functionName,
      data: sanitizeData(data)
    };

    state.logs.push(entry);

    // Enforce maximum log count
    if (state.logs.length > MAX_LOGS_COUNT) {
      state.logs = state.logs.slice(-MAX_LOGS_COUNT);
    }

    logToConsole(entry);
  },

  /**
   * Send an error log entry - convenience method for try/catch blocks
   */
  sendError(
    error: Error | string | unknown,
    fileName?: string,
    functionName?: string,
    additionalData?: Record<string, unknown>
  ) {
    let message: string;
    let data: Record<string, unknown> = sanitizeData(additionalData) || {};

    if (error instanceof Error) {
      message = error.message || 'Error occurred';
      // Sanitize stack trace to remove sensitive file paths
      data['stack'] = error.stack ? sanitizeStackTrace(error.stack) : undefined;
      data['name'] = error.name;

      // Sanitize any additional properties on the error object
      const errorProps: Record<string, unknown> = {};
      Object.getOwnPropertyNames(error).forEach(prop => {
        if (prop !== 'message' && prop !== 'stack' && prop !== 'name') {
          errorProps[prop] = (error as any)[prop];
        }
      });

      if (Object.keys(errorProps).length > 0) {
        Object.assign(data, sanitizeValue(errorProps) as Record<string, unknown>);
      }
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      // Handle error-like objects (e.g., RPC errors, custom error objects)
      message = String((error as any).message) || 'Error occurred';
      // Include all properties of the error object
      Object.assign(data, sanitizeValue(error) as Record<string, unknown>);
    } else {
      message = 'Unknown error occurred';
      // Sanitize the original error object
      data['originalError'] = sanitizeValue(error);
    }

    // Note: sanitization happens in sendLog method
    this.sendLog('error', message, fileName, functionName, data);
  },

  /**
   * Send an info log entry
   */
  sendInfo(
    message: string,
    fileName?: string,
    functionName?: string,
    data?: Record<string, unknown>
  ) {
    this.sendLog('info', message, fileName, functionName, data);
  },

  /**
   * Send a warning log entry
   */
  sendWarn(
    message: string,
    fileName?: string,
    functionName?: string,
    data?: Record<string, unknown>
  ) {
    this.sendLog('warn', message, fileName, functionName, data);
  },

  /**
   * Send a debug log entry
   */
  sendDebug(
    message: string,
    fileName?: string,
    functionName?: string,
    data?: Record<string, unknown>
  ) {
    this.sendLog('debug', message, fileName, functionName, data);
  },

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...state.logs];
  },

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return state.logs.filter(log => log.level === level);
  },

  /**
   * Get recent logs (last N entries)
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return state.logs.slice(-count);
  },

  /**
   * Clear all logs
   */
  clearLogs() {
    state.logs = [];
  },

  /**
   * Export logs as JSON string for debugging
   */
  exportLogs(): string {
    return JSON.stringify(state.logs, null, 2);
  },

  /**
   * Get logs count by level
   */
  getLogsStats(): Record<LogLevel, number> {
    const stats: Record<LogLevel, number> = {
      info: 0,
      warn: 0,
      error: 0,
      debug: 0
    };

    state.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }
};
