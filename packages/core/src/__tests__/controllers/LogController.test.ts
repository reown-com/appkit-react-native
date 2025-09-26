import { LogController, type LogEntry } from '../../controllers/LogController';
import { OptionsController } from '../../controllers/OptionsController';

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  debug: jest.spyOn(console, 'debug').mockImplementation()
};

describe('LogController', () => {
  beforeEach(() => {
    // Clear logs before each test
    LogController.clearLogs();
    // Clear console spy calls
    Object.values(consoleSpy).forEach(spy => spy.mockClear());
    // Reset debug mode
    OptionsController.setDebug(false);
  });

  afterEach(() => {
    LogController.destroy();
  });

  describe('Basic Logging', () => {
    it('should initialize correctly', () => {
      LogController.initialize();
      expect(LogController.state.logs).toEqual([]);
      expect(LogController.state.maxRetentionHours).toBe(24);
    });

    it('should send info log', () => {
      LogController.sendInfo('Test info message', 'TestFile.ts', 'testFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'info',
        message: 'Test info message',
        fileName: 'TestFile.ts',
        functionName: 'testFunction'
      });
      expect(logs[0]?.id).toBeDefined();
      expect(logs[0]?.timestamp).toBeDefined();
    });

    it('should send error log with Error object', () => {
      const testError = new Error('Test error message');
      LogController.sendError(testError, 'ErrorFile.ts', 'errorFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'error',
        message: 'Test error message',
        fileName: 'ErrorFile.ts',
        functionName: 'errorFunction'
      });
      expect(logs[0]?.data?.['stack']).toBeDefined();
      expect(logs[0]?.data?.['name']).toBe('Error');
    });

    it('should send error log with string', () => {
      LogController.sendError('String error message', 'StringFile.ts', 'stringFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'error',
        message: 'String error message',
        fileName: 'StringFile.ts',
        functionName: 'stringFunction'
      });
    });

    it('should send warning log', () => {
      LogController.sendWarn('Test warning', 'WarnFile.ts', 'warnFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe('warn');
    });

    it('should send debug log', () => {
      LogController.sendDebug('Test debug', 'DebugFile.ts', 'debugFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe('debug');
    });
  });

  describe('Console Integration', () => {
    it('should not log to console when debug is false', () => {
      OptionsController.setDebug(false);
      LogController.sendInfo('Test message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should log to console when debug is true', () => {
      OptionsController.setDebug(true);
      LogController.sendInfo('Test message', 'TestFile.ts', 'testFunction');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[AppKit'), '');
    });

    it('should use correct console method for each log level', () => {
      OptionsController.setDebug(true);

      LogController.sendInfo('Info message');
      LogController.sendWarn('Warn message');
      LogController.sendError('Error message');
      LogController.sendDebug('Debug message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('Log Management', () => {
    it('should filter logs by level', () => {
      LogController.sendInfo('Info 1');
      LogController.sendError('Error 1');
      LogController.sendWarn('Warn 1');
      LogController.sendInfo('Info 2');

      const infoLogs = LogController.getLogsByLevel('info');
      const errorLogs = LogController.getLogsByLevel('error');

      expect(infoLogs).toHaveLength(2);
      expect(errorLogs).toHaveLength(1);
      expect(infoLogs.every(log => log.level === 'info')).toBe(true);
      expect(errorLogs.every(log => log.level === 'error')).toBe(true);
    });

    it('should get recent logs', () => {
      // Add multiple logs
      for (let i = 0; i < 5; i++) {
        LogController.sendInfo(`Message ${i}`);
      }

      const recentLogs = LogController.getRecentLogs(3);
      expect(recentLogs).toHaveLength(3);
      expect(recentLogs[2]?.message).toBe('Message 4'); // Most recent
    });

    it('should clear all logs', () => {
      LogController.sendInfo('Test message');
      expect(LogController.getLogs()).toHaveLength(1);

      LogController.clearLogs();
      expect(LogController.getLogs()).toHaveLength(0);
    });

    it('should export logs as JSON', () => {
      LogController.sendInfo('Test message', 'TestFile.ts', 'testFunction');

      const exported = LogController.exportLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test message');
    });

    it('should get logs statistics', () => {
      LogController.sendInfo('Info 1');
      LogController.sendInfo('Info 2');
      LogController.sendError('Error 1');
      LogController.sendWarn('Warn 1');

      const stats = LogController.getLogsStats();

      expect(stats).toEqual({
        info: 2,
        error: 1,
        warn: 1,
        debug: 0
      });
    });

    it('should filter logs by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      LogController.sendInfo('Old message');

      // Manually set timestamp to simulate old log
      const logs = LogController.getLogs();
      logs[0]!.timestamp = oneHourAgo;

      LogController.sendInfo('New message');

      const recentLogs = LogController.getLogsByTimeRange(now - 1000, now + 1000);
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0]?.message).toBe('New message');
    });
  });

  describe('Retention Management', () => {
    it('should set retention hours', () => {
      LogController.setLogRetentionHours(12);
      expect(LogController.state.maxRetentionHours).toBe(12);
    });

    it('should cleanup old logs based on retention', () => {
      // Set short retention for testing
      LogController.setLogRetentionHours(0.001); // ~3.6 seconds

      LogController.sendInfo('Old message');

      // Manually set timestamp to simulate old log
      const logs = LogController.getLogs();
      logs[0]!.timestamp = Date.now() - 60 * 60 * 1000; // 1 hour ago

      LogController.sendInfo('New message');

      // Force cleanup
      LogController.forceCleanup();

      const remainingLogs = LogController.getLogs();
      expect(remainingLogs).toHaveLength(1);
      expect(remainingLogs[0]?.message).toBe('New message');
    });
  });

  describe('Data Handling', () => {
    it('should include additional data in logs', () => {
      const additionalData = { userId: '123', action: 'test' };
      LogController.sendInfo('Message with data', 'TestFile.ts', 'testFunction', additionalData);

      const logs = LogController.getLogs();
      expect(logs[0]?.data).toEqual(additionalData);
    });

    it('should handle unknown error types', () => {
      const unknownError = { weird: 'object', code: 500 };
      LogController.sendError(unknownError, 'TestFile.ts', 'testFunction');

      const logs = LogController.getLogs();
      expect(logs[0]?.message).toBe('Unknown error occurred');
      expect(logs[0]?.data?.['originalError']).toEqual(unknownError);
    });
  });

  describe('Concurrent Access Patterns', () => {
    beforeEach(() => {
      LogController.clearLogs();
      LogController.initialize();
    });

    afterEach(() => {
      LogController.destroy();
    });

    it('should handle concurrent log writes without data corruption', async () => {
      const promises: Promise<void>[] = [];
      const expectedMessages = new Set<string>();

      // Create 50 concurrent log operations
      for (let i = 0; i < 50; i++) {
        const message = `Concurrent message ${i}`;
        expectedMessages.add(message);

        promises.push(
          new Promise<void>(resolve => {
            setTimeout(() => {
              LogController.sendInfo(message, 'ConcurrentTest.ts', 'testFunction');
              resolve();
            }, Math.random() * 10); // Random delay 0-10ms
          })
        );
      }

      await Promise.all(promises);

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(50);

      // Verify all messages were logged correctly
      const actualMessages = new Set(logs.map(log => log.message));
      expect(actualMessages).toEqual(expectedMessages);

      // Verify no duplicate IDs
      const ids = logs.map(log => log.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should handle concurrent cleanup operations safely', async () => {
      // Add logs with old timestamps
      for (let i = 0; i < 20; i++) {
        LogController.sendInfo(`Old message ${i}`, 'CleanupTest.ts', 'testFunction');
      }

      // Manually set old timestamps
      const logs = LogController.getLogs();
      logs.forEach((log, index) => {
        if (index < 10) {
          // Make first 10 logs old (25 hours ago)
          log.timestamp = Date.now() - 25 * 60 * 60 * 1000;
        }
      });

      // Trigger multiple concurrent cleanup operations
      const cleanupPromises = Array.from(
        { length: 10 },
        () =>
          new Promise<void>(resolve => {
            setTimeout(() => {
              LogController.forceCleanup();
              resolve();
            }, Math.random() * 5);
          })
      );

      await Promise.all(cleanupPromises);

      const remainingLogs = LogController.getLogs();
      expect(remainingLogs.length).toBeLessThanOrEqual(10); // Old logs should be cleaned up
    });

    it('should handle mixed concurrent read/write operations', async () => {
      const operations: Promise<any>[] = [];

      // Add some initial logs
      for (let i = 0; i < 10; i++) {
        LogController.sendInfo(`Initial message ${i}`, 'MixedTest.ts', 'testFunction');
      }

      // Concurrent writes
      for (let i = 0; i < 20; i++) {
        operations.push(
          new Promise<void>(resolve => {
            setTimeout(() => {
              LogController.sendError(`Concurrent error ${i}`, 'MixedTest.ts', 'errorFunction');
              resolve();
            }, Math.random() * 10);
          })
        );
      }

      // Concurrent reads
      for (let i = 0; i < 15; i++) {
        operations.push(
          new Promise<LogEntry[]>(resolve => {
            setTimeout(() => {
              const logs = LogController.getLogs();
              resolve(logs);
            }, Math.random() * 10);
          })
        );
      }

      const results = await Promise.all(operations);

      // Verify final state
      const finalLogs = LogController.getLogs();
      expect(finalLogs.length).toBeGreaterThanOrEqual(30); // 10 initial + 20 concurrent

      // Verify read operations returned valid data
      const readResults = results.slice(20) as LogEntry[][];
      readResults.forEach(logs => {
        expect(Array.isArray(logs)).toBe(true);
        logs.forEach(log => {
          expect(log).toHaveProperty('id');
          expect(log).toHaveProperty('timestamp');
          expect(log).toHaveProperty('level');
          expect(log).toHaveProperty('message');
        });
      });
    });
  });

  describe('Memory Cleanup Under Load', () => {
    beforeEach(() => {
      LogController.clearLogs();
      LogController.initialize();
    });

    afterEach(() => {
      LogController.destroy();
    });

    it('should handle cleanup with maximum log count exceeded', () => {
      // Add more than MAX_LOGS_COUNT (300) logs
      for (let i = 0; i < 350; i++) {
        LogController.sendInfo(`Load test message ${i}`, 'LoadTest.ts', 'testFunction');
      }

      const logs = LogController.getLogs();
      expect(logs.length).toBeLessThanOrEqual(300); // Should be capped at MAX_LOGS_COUNT

      // Verify the most recent logs are kept
      const lastLog = logs[logs.length - 1];
      expect(lastLog?.message).toContain('Load test message');
    });

    it('should handle rapid successive cleanup operations', () => {
      // Add logs with mixed timestamps
      for (let i = 0; i < 100; i++) {
        LogController.sendInfo(`Rapid message ${i}`, 'RapidTest.ts', 'testFunction');
      }

      const logs = LogController.getLogs();
      // Make half of them old
      logs.forEach((log, index) => {
        if (index % 2 === 0) {
          log.timestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
        }
      });

      // Trigger rapid cleanup operations
      for (let i = 0; i < 10; i++) {
        LogController.forceCleanup();
      }

      const remainingLogs = LogController.getLogs();
      expect(remainingLogs.length).toBeLessThanOrEqual(50); // Roughly half should remain
    });

    it('should maintain performance under memory pressure', () => {
      const startTime = Date.now();

      // Add a large number of logs quickly
      for (let i = 0; i < 1000; i++) {
        LogController.sendError(
          new Error(`Performance test error ${i}`),
          'PerformanceTest.ts',
          'testFunction',
          { index: i, data: 'x'.repeat(100) } // Some additional data
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second for 1000 logs)
      expect(duration).toBeLessThan(1000);

      const logs = LogController.getLogs();
      expect(logs.length).toBeLessThanOrEqual(300); // Capped at MAX_LOGS_COUNT
    });

    it('should handle retention time changes under load', () => {
      // Add logs
      for (let i = 0; i < 50; i++) {
        LogController.sendInfo(`Retention test ${i}`, 'RetentionTest.ts', 'testFunction');
      }

      // Change retention multiple times rapidly
      LogController.setLogRetentionHours(1);
      LogController.setLogRetentionHours(48);
      LogController.setLogRetentionHours(12);
      LogController.setLogRetentionHours(24);

      const logs = LogController.getLogs();
      expect(LogController.state.maxRetentionHours).toBe(24);
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Malformed Error Objects', () => {
    beforeEach(() => {
      LogController.clearLogs();
      LogController.initialize();
    });

    afterEach(() => {
      LogController.destroy();
    });

    it('should handle Error objects with missing properties', () => {
      const malformedError = Object.create(Error.prototype);
      malformedError.message = undefined;
      malformedError.stack = null;
      malformedError.name = '';

      LogController.sendError(malformedError, 'MalformedTest.ts', 'testFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe('error');
      expect(typeof logs[0]?.message).toBe('string');
    });

    it('should handle Error objects with circular references', () => {
      const circularError = new Error('Circular error');
      const circularData: any = { error: circularError };
      circularData.self = circularData; // Create circular reference

      LogController.sendError(circularError, 'CircularTest.ts', 'testFunction', circularData);

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.message).toBe('Circular error');
      // Should not throw and should handle circular reference safely
    });

    it('should handle Error objects with non-string properties', () => {
      const weirdError: any = new Error('Weird error');
      weirdError.message = { toString: () => 'Object message' };
      weirdError.stack = 12345;
      weirdError.name = ['Array', 'Name'];

      LogController.sendError(weirdError, 'WeirdTest.ts', 'testFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe('error');
      expect(typeof logs[0]?.message).toBe('string');
    });

    it('should handle null and undefined errors gracefully', () => {
      LogController.sendError(null, 'NullTest.ts', 'testFunction');
      LogController.sendError(undefined, 'UndefinedTest.ts', 'testFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(2);
      logs.forEach(log => {
        expect(log.level).toBe('error');
        expect(log.message).toBe('Unknown error occurred');
      });
    });

    it('should handle Error objects with very long messages and stacks', () => {
      const longMessage = 'x'.repeat(10000); // Very long message
      const longStack = Array.from(
        { length: 100 },
        (_, i) => `    at function${i} (/very/long/path/to/file/with/sensitive/data.ts:${i}:${i})`
      ).join('\n');

      const longError = new Error(longMessage);
      Object.defineProperty(longError, 'stack', { value: longStack });

      LogController.sendError(longError, 'LongTest.ts', 'testFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log?.message.length).toBeLessThanOrEqual(500); // Should be truncated
      expect(log?.data?.['stack']).toBeDefined();

      const stackLines = (log?.data?.['stack'] as string)?.split('\n') || [];
      expect(stackLines.length).toBeLessThanOrEqual(11); // 10 lines + truncation message
    });

    it('should handle Error objects with sensitive data in various properties', () => {
      const sensitiveError = new Error('Database connection failed');
      (sensitiveError as any).password = 'secret123';
      (sensitiveError as any).api_key = 'sk_live_dangerous';
      (sensitiveError as any).user_token = 'bearer_token_123';
      (sensitiveError as any).safe_data = 'this is safe';

      LogController.sendError(sensitiveError, 'SensitiveTest.ts', 'testFunction', {
        connection_string: 'mongodb://user:pass@host:port/db',
        debug_info: 'safe debug info',
        authorization: 'Bearer secret_token'
      });

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log?.message).toBe('Database connection failed');

      // Verify sensitive data is redacted
      const data = log?.data as Record<string, any>;
      expect(data?.['password']).toBe('[REDACTED]');
      expect(data?.['api_key']).toBe('[REDACTED]');
      expect(data?.['user_token']).toBe('[REDACTED]');
      expect(data?.['connection_string']).toBe('[REDACTED]');
      expect(data?.['authorization']).toBe('[REDACTED]');

      // Verify safe data is preserved
      expect(data?.['safe_data']).toBe('this is safe');
      expect(data?.['debug_info']).toBe('safe debug info');
    });

    it('should handle deeply nested error objects', () => {
      const deepError = new Error('Deep error');
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  password: 'deep_secret',
                  safe_value: 'safe',
                  level6: {
                    api_key: 'nested_key'
                  }
                }
              }
            }
          }
        }
      };

      LogController.sendError(deepError, 'DeepTest.ts', 'testFunction', deepData);

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(1);

      const log = logs[0];
      expect(log?.message).toBe('Deep error');
      expect(log?.data).toBeDefined();

      // Should handle deep nesting and sanitize sensitive data
      const data = log?.data as any;
      expect(data?.level1?.level2?.level3?.level4?.level5?.password).toBe('[REDACTED]');
      expect(data?.level1?.level2?.level3?.level4?.level5?.safe_value).toBe('safe');
    });
  });
});
