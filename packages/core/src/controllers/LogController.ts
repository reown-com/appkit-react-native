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
  maxRetentionHours: number;
}

// -- Constants ----------------------------------------- //
const DEFAULT_MAX_RETENTION_HOURS = 24;
const MAX_LOGS_COUNT = 300; // Prevent memory issues

// -- State --------------------------------------------- //
const state = proxy<LogControllerState>({
  logs: [],
  maxRetentionHours: DEFAULT_MAX_RETENTION_HOURS
});

// -- Private Functions --------------------------------- //
let lastCleanupTime = 0;
const CLEANUP_THROTTLE_MS = 5 * 60 * 1000; // Only cleanup every 5 minutes max

const generateLogId = (): string => {
  return CoreHelperUtil.getUUID();
};

const cleanupOldLogsIfNeeded = () => {
  const now = Date.now();

  // Throttle cleanup to avoid excessive processing
  if (now - lastCleanupTime < CLEANUP_THROTTLE_MS) {
    return;
  }

  const maxAge = state.maxRetentionHours * 60 * 60 * 1000; // Convert hours to milliseconds
  const initialCount = state.logs.length;

  // Remove old logs
  state.logs = state.logs.filter(log => now - log.timestamp <= maxAge);

  // Also limit total count to prevent memory issues
  if (state.logs.length > MAX_LOGS_COUNT) {
    state.logs = state.logs.slice(-MAX_LOGS_COUNT);
  }

  lastCleanupTime = now;

  // Optional: Log cleanup stats in debug mode
  if (OptionsController.state.debug && initialCount > state.logs.length) {
    // eslint-disable-next-line no-console
    console.log(`[AppKit LogController] Cleaned up ${initialCount - state.logs.length} old logs`);
  }
};

const logToConsole = (entry: LogEntry) => {
  const { debug } = OptionsController.state;

  if (!debug) {
    return;
  }

  const timestamp = new Date(entry.timestamp).toISOString();
  const location =
    entry.fileName && entry.functionName
      ? `[${entry.fileName}:${entry.functionName}]`
      : entry.fileName
      ? `[${entry.fileName}]`
      : '';

  const logMessage = `[AppKit ${timestamp}] ${location} ${entry.message}`;

  switch (entry.level) {
    case 'error':
      // eslint-disable-next-line no-console
      console.error(logMessage, entry.data || '');
      break;
    case 'warn':
      console.warn(logMessage, entry.data || '');
      break;
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(logMessage, entry.data || '');
      break;
    case 'info':
    default:
      // eslint-disable-next-line no-console
      console.log(logMessage, entry.data || '');
      break;
  }
};

// -- Controller ---------------------------------------- //
export const LogController = {
  state,

  /**
   * Initialize the LogController
   */
  initialize() {
    // Perform initial cleanup of any existing old logs
    cleanupOldLogsIfNeeded();
  },

  /**
   * Destroy the LogController (cleanup resources)
   */
  destroy() {
    // No background timers to clean up - using lazy cleanup approach
    state.logs = [];
    lastCleanupTime = 0;
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

    // Trigger lazy cleanup when needed (throttled)
    cleanupOldLogsIfNeeded();
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
    cleanupOldLogsIfNeeded(); // Lazy cleanup when logs are accessed

    return [...state.logs];
  },

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return state.logs.filter(log => log.level === level);
  },

  /**
   * Get logs within a time range
   */
  getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return state.logs.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
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
   * Set log retention hours
   */
  setLogRetentionHours(hours: number) {
    state.maxRetentionHours = hours;
    lastCleanupTime = 0; // Reset throttle to force immediate cleanup
    cleanupOldLogsIfNeeded(); // Clean up immediately with new retention
  },

  /**
   * Force cleanup of old logs (bypasses throttling)
   */
  forceCleanup() {
    lastCleanupTime = 0; // Reset throttle
    cleanupOldLogsIfNeeded();
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
