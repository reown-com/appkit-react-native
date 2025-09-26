/* eslint-disable valtio/state-snapshot-rule */
import { useContext, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { LogController, type LogEntry, type LogLevel } from '@reown/appkit-core-react-native';
import { AppKitContext } from '../AppKitContext';

export interface UseAppKitLogsReturn {
  /**
   * All logs from AppKit (regular array, safe for console.log)
   */
  logs: LogEntry[];

  /**
   * Get logs filtered by level
   */
  getLogsByLevel: (level: LogLevel) => LogEntry[];

  /**
   * Get recent logs (default: 100)
   */
  getRecentLogs: (count?: number) => LogEntry[];

  /**
   * Get logs within a time range
   */
  getLogsByTimeRange: (startTime: number, endTime: number) => LogEntry[];

  /**
   * Export all logs as JSON string
   */
  exportLogs: () => string;

  /**
   * Get logging statistics by level
   */
  getLogsStats: () => Record<LogLevel, number>;

  /**
   * Clear all logs
   */
  clearLogs: () => void;

  /**
   * Set log retention period in hours
   */
  setLogRetentionHours: (hours: number) => void;

  /**
   * Current retention hours setting
   */
  maxRetentionHours: number;

  /**
   * Convenience getters for different log levels (regular arrays, safe for console.log)
   */
  errorLogs: LogEntry[];
  warningLogs: LogEntry[];
  infoLogs: LogEntry[];
  debugLogs: LogEntry[];
}

/**
 * React hook for accessing AppKit logs
 *
 * This hook provides reactive access to AppKit's internal logging system.
 * It automatically updates when new logs are added or when logs are cleaned up.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { logs, errorLogs, exportLogs, clearLogs } = useAppKitLogs();
 *
 *   return (
 *     <View>
 *       <Text>Total logs: {logs.length}</Text>
 *       <Text>Error logs: {errorLogs.length}</Text>
 *       <Button onPress={clearLogs} title="Clear Logs" />
 *     </View>
 *   );
 * }
 * ```
 */
export const useAppKitLogs = (): UseAppKitLogsReturn => {
  const context = useContext(AppKitContext);

  if (context === undefined) {
    throw new Error('useAppKitLogs must be used within an AppKitProvider');
  }

  if (!context.appKit) {
    throw new Error('AppKit instance is not yet available in context.');
  }

  // Use valtio snapshot to get reactive updates
  const { logs, maxRetentionHours } = useSnapshot(LogController.state);

  // Memoized functions that don't need to change on every render
  const stableFunctions = useMemo(
    () => ({
      getLogsByLevel: (level: LogLevel) => LogController.getLogsByLevel(level),
      getRecentLogs: (count?: number) => LogController.getRecentLogs(count),
      getLogsByTimeRange: (startTime: number, endTime: number) =>
        LogController.getLogsByTimeRange(startTime, endTime),
      exportLogs: () => LogController.exportLogs(),
      getLogsStats: () => LogController.getLogsStats(),
      clearLogs: () => LogController.clearLogs(),
      setLogRetentionHours: (hours: number) => LogController.setMaxRetentionHours(hours)
    }),
    []
  );

  // Convert proxy arrays to regular arrays to avoid console.log issues
  const regularArrays = useMemo(
    () => ({
      logs: [...logs], // Convert proxy array to regular array
      errorLogs: [...logs.filter(log => log.level === 'error')],
      warningLogs: [...logs.filter(log => log.level === 'warn')],
      infoLogs: [...logs.filter(log => log.level === 'info')],
      debugLogs: [...logs.filter(log => log.level === 'debug')]
    }),
    [logs]
  );

  return {
    ...regularArrays,
    maxRetentionHours,
    ...stableFunctions
  };
};
