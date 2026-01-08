import { useState, useCallback } from 'react';
import { logError, ErrorCategory, ErrorSeverity } from '../utils/errorLogger';
import type { ErrorContext, ErrorInfo, UseErrorHandlerReturn } from '../types';

/**
 * useErrorHandler - Custom hook for handling errors in components
 *
 * FAANG Best Practice: Centralized error handling for async operations
 *
 * Usage:
 *   const { error, handleError, clearError } = useErrorHandler();
 *
 *   const fetchData = async () => {
 *     try {
 *       const data = await api.get('/data');
 *       setData(data);
 *     } catch (err) {
 *       handleError(err, { context: 'fetching data' });
 *     }
 *   };
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const handleError = useCallback((err: Error, context: ErrorContext = {}): ErrorInfo => {
    // Log the error
    const errorInfo = logError(err, {
      category: context.category || ErrorCategory.UNEXPECTED,
      severity: context.severity || ErrorSeverity.MEDIUM,
      ...context,
    });

    // Set error state for UI display
    setError({
      message: err.message || 'An unexpected error occurred',
      ...errorInfo,
    });

    return errorInfo;
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
};

/**
 * useAsyncError - Hook specifically for async operations
 *
 * Returns a wrapper function that automatically handles errors
 *
 * Usage:
 *   const wrapAsync = useAsyncError();
 *
 *   const fetchData = wrapAsync(async () => {
 *     const data = await api.get('/data');
 *     setData(data);
 *   }, { context: 'fetching user data' });
 */
export const useAsyncError = <T = unknown>() => {
  const { handleError } = useErrorHandler();

  const wrapAsync = useCallback(
    <Args extends unknown[]>(
      asyncFn: (...args: Args) => Promise<T>,
      context: ErrorContext = {}
    ) => {
      return async (...args: Args): Promise<T> => {
        try {
          return await asyncFn(...args);
        } catch (error) {
          handleError(error as Error, context);
          throw error; // Re-throw so caller can handle if needed
        }
      };
    },
    [handleError]
  );

  return wrapAsync;
};
