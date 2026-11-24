import { LogController } from '../../controllers/LogController';
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
    it('should not log when debug is false', () => {
      OptionsController.setDebug(false);
      LogController.sendInfo('This should not be logged', 'TestFile.ts', 'testFunction');
      LogController.sendError('This error should not be logged', 'TestFile.ts', 'testFunction');
      LogController.sendWarn('This warning should not be logged', 'TestFile.ts', 'testFunction');
      LogController.sendDebug('This debug should not be logged', 'TestFile.ts', 'testFunction');

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(0);
    });

    // All subsequent tests in this describe block need debug mode enabled
    describe('with debug enabled', () => {
      beforeEach(() => {
        OptionsController.setDebug(true);
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

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[AppKit]'));
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
    beforeEach(() => {
      OptionsController.setDebug(true);
    });

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
  });

  describe('Data Handling', () => {
    beforeEach(() => {
      OptionsController.setDebug(true);
    });

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

  describe('Memory Cleanup Under Load', () => {
    beforeEach(() => {
      LogController.clearLogs();
      OptionsController.setDebug(true);
    });

    afterEach(() => {
      LogController.destroy();
    });

    it('should stay bounded under memory pressure', () => {
      // No wall-clock assertion here: CI runs every package's tests in parallel on
      // shared runners, so timing is not a reliable signal. What matters is that the
      // buffer never grows past MAX_LOGS_COUNT (300) and keeps the newest entries.
      let maxObservedLength = 0;

      for (let i = 0; i < 1000; i++) {
        LogController.sendError(
          new Error(`Performance test error ${i}`),
          'PerformanceTest.ts',
          'testFunction',
          { index: i, data: 'x'.repeat(100) } // Some additional data
        );
        maxObservedLength = Math.max(maxObservedLength, LogController.state.logs.length);
      }

      expect(maxObservedLength).toBe(300);

      const logs = LogController.getLogs();
      expect(logs).toHaveLength(300);
      expect(logs[0]?.message).toBe('Performance test error 700');
      expect(logs[logs.length - 1]?.message).toBe('Performance test error 999');
    });
  });

  describe('Malformed Error Objects', () => {
    beforeEach(() => {
      LogController.clearLogs();
      OptionsController.setDebug(true);
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
