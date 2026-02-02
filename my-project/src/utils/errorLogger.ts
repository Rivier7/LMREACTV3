/**
 * Centralized Error Logger
 *
 * FAANG Best Practice: All errors should be logged consistently
 * - Development: Log to console with detailed info
 * - Production: Send to monitoring service (Sentry, LogRocket, etc.)
 *
 * Error Categories:
 * - API: Network/server errors
 * - VALIDATION: User input errors
 * - AUTH: Authentication/authorization errors
 * - UNEXPECTED: Uncaught runtime errors
 */

import type {
  ErrorContext,
  ErrorInfo,
  ErrorSeverityType,
  ErrorCategoryType,
  ApiError,
} from '../types';

export const ErrorSeverity = {
  LOW: 'low' as ErrorSeverityType,
  MEDIUM: 'medium' as ErrorSeverityType,
  HIGH: 'high' as ErrorSeverityType,
  CRITICAL: 'critical' as ErrorSeverityType,
};

export const ErrorCategory = {
  API: 'api' as ErrorCategoryType,
  VALIDATION: 'validation' as ErrorCategoryType,
  AUTH: 'auth' as ErrorCategoryType,
  UNEXPECTED: 'unexpected' as ErrorCategoryType,
  NETWORK: 'network' as ErrorCategoryType,
};

/**
 * Log error to console and/or external service
 */
export const logError = (error: Error, context: ErrorContext = {}): ErrorInfo => {
  const category = context.category ?? ErrorCategory.UNEXPECTED;
  const severity = context.severity ?? ErrorSeverity.MEDIUM;

  const errorInfo: ErrorInfo = {
    message: error.message || 'Unknown error',
    stack: error.stack,
    category,
    severity,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Add other context properties
  Object.keys(context).forEach(key => {
    if (key !== 'category' && key !== 'severity') {
      errorInfo[key] = context[key];
    }
  });

  // Development: Log to console with styling
  if (import.meta.env.DEV) {
    const severityColors: Record<ErrorSeverityType, string> = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    };

    console.group(
      `%c🔴 Error [${errorInfo.severity.toUpperCase()}] - ${errorInfo.category}`,
      `color: ${severityColors[errorInfo.severity]}; font-weight: bold;`
    );
    console.error('Message:', errorInfo.message);
    console.error('Context:', context);
    console.error('Stack:', error.stack);
    console.groupEnd();
  }

  // Production: Send to error tracking service
  if (import.meta.env.PROD) {
    console.error('[Production Error]', errorInfo);
  }

  return errorInfo;
};

/**
 * Log API errors with automatic categorization
 */
export const logApiError = (error: ApiError, endpoint: string = ''): ErrorInfo => {
  const status = error.response?.status;
  let severity = ErrorSeverity.MEDIUM;
  let category = ErrorCategory.API;

  if (status === 401 || status === 403) {
    category = ErrorCategory.AUTH;
    severity = ErrorSeverity.HIGH;
  } else if (status && status >= 500) {
    severity = ErrorSeverity.HIGH;
  } else if (!status) {
    category = ErrorCategory.NETWORK;
    severity = ErrorSeverity.CRITICAL;
  }

  // In production, only log status code to avoid exposing sensitive backend data
  const responseData = import.meta.env.PROD
    ? { status }
    : error.response?.data;

  return logError(error as Error, {
    category,
    severity,
    endpoint,
    status,
    responseData,
  });
};

/**
 * Log validation errors (user input issues)
 */
export const logValidationError = (message: string, field: string = ''): ErrorInfo => {
  const error = new Error(message);
  return logError(error, {
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    field,
  });
};

/**
 * Log authentication errors
 */
export const logAuthError = (message: string, context: ErrorContext = {}): ErrorInfo => {
  const error = new Error(message);
  return logError(error, {
    category: ErrorCategory.AUTH,
    severity: ErrorSeverity.HIGH,
    ...context,
  });
};

/**
 * Handle promise rejections globally
 */
export const setupGlobalErrorHandlers = (): void => {
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    logError(event.reason || new Error('Unhandled Promise Rejection'), {
      category: ErrorCategory.UNEXPECTED,
      severity: ErrorSeverity.HIGH,
      type: 'unhandledRejection',
    });
  });

  window.addEventListener('error', (event: ErrorEvent) => {
    logError(event.error || new Error(event.message), {
      category: ErrorCategory.UNEXPECTED,
      severity: ErrorSeverity.HIGH,
      type: 'globalError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
};
