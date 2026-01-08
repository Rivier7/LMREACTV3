import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logError,
  logApiError,
  logValidationError,
  logAuthError,
  setupGlobalErrorHandlers,
  ErrorSeverity,
  ErrorCategory,
} from './errorLogger';

describe('errorLogger', () => {
  let consoleErrorSpy;
  let consoleGroupSpy;
  let consoleGroupEndSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  describe('logError', () => {
    it('should log error with default category and severity', () => {
      const error = new Error('Test error');
      const result = logError(error);

      expect(result.message).toBe('Test error');
      expect(result.category).toBe(ErrorCategory.UNEXPECTED);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.timestamp).toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error with custom context', () => {
      const error = new Error('Custom error');
      const result = logError(error, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        customField: 'test',
      });

      expect(result.category).toBe(ErrorCategory.API);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.customField).toBe('test');
    });

    it('should include stack trace', () => {
      const error = new Error('Stack test');
      const result = logError(error);

      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe('string');
    });

    it('should include URL and user agent', () => {
      const error = new Error('Context test');
      const result = logError(error);

      expect(result.url).toBeDefined();
      expect(result.userAgent).toBeDefined();
    });
  });

  describe('logApiError', () => {
    it('should log 401 error as AUTH with HIGH severity', () => {
      const error = {
        message: 'Unauthorized',
        response: { status: 401, data: { error: 'Invalid token' } },
      };

      const result = logApiError(error, '/api/users');

      expect(result.category).toBe(ErrorCategory.AUTH);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.endpoint).toBe('/api/users');
      expect(result.status).toBe(401);
    });

    it('should log 403 error as AUTH with HIGH severity', () => {
      const error = {
        message: 'Forbidden',
        response: { status: 403 },
      };

      const result = logApiError(error);

      expect(result.category).toBe(ErrorCategory.AUTH);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should log 500 error as API with HIGH severity', () => {
      const error = {
        message: 'Server error',
        response: { status: 500 },
      };

      const result = logApiError(error, '/api/data');

      expect(result.category).toBe(ErrorCategory.API);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should log network error as NETWORK with CRITICAL severity', () => {
      const error = {
        message: 'Network Error',
        response: undefined,
      };

      const result = logApiError(error);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('should log 400 error as API with MEDIUM severity', () => {
      const error = {
        message: 'Bad request',
        response: { status: 400 },
      };

      const result = logApiError(error);

      expect(result.category).toBe(ErrorCategory.API);
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('logValidationError', () => {
    it('should log validation error with LOW severity', () => {
      const result = logValidationError('Invalid email format', 'email');

      expect(result.message).toBe('Invalid email format');
      expect(result.category).toBe(ErrorCategory.VALIDATION);
      expect(result.severity).toBe(ErrorSeverity.LOW);
      expect(result.field).toBe('email');
    });

    it('should work without field parameter', () => {
      const result = logValidationError('Form validation failed');

      expect(result.message).toBe('Form validation failed');
      expect(result.field).toBe('');
    });
  });

  describe('logAuthError', () => {
    it('should log auth error with HIGH severity', () => {
      const result = logAuthError('Session expired');

      expect(result.message).toBe('Session expired');
      expect(result.category).toBe(ErrorCategory.AUTH);
      expect(result.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should accept custom context', () => {
      const result = logAuthError('Invalid credentials', { attemptCount: 3 });

      expect(result.message).toBe('Invalid credentials');
      expect(result.attemptCount).toBe(3);
    });
  });

  describe('setupGlobalErrorHandlers', () => {
    it('should set up global error handlers without throwing', () => {
      expect(() => setupGlobalErrorHandlers()).not.toThrow();
    });

    it('should handle unhandled promise rejections', () => {
      setupGlobalErrorHandlers();

      const event = new Event('unhandledrejection');
      event.reason = new Error('Unhandled rejection');

      window.dispatchEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle global errors', () => {
      setupGlobalErrorHandlers();

      const event = new ErrorEvent('error', {
        error: new Error('Global error'),
        message: 'Global error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      });

      window.dispatchEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
