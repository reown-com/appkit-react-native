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
      LogController.setMaxRetentionHours(12);
      expect(LogController.state.maxRetentionHours).toBe(12);
    });

    it('should cleanup old logs based on retention', () => {
      // Set short retention for testing
      LogController.setMaxRetentionHours(0.001); // ~3.6 seconds

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
});
