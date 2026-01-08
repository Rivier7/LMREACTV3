import React from 'react';
import { X } from 'lucide-react';

/**
 * ErrorMessage - Reusable error message component
 *
 * FAANG Best Practice: Consistent error UI across the application
 *
 * Usage:
 *   <ErrorMessage
 *     message="Failed to load data"
 *     onDismiss={() => clearError()}
 *   />
 */
const ErrorMessage = ({
  message,
  title = 'Error',
  onDismiss,
  severity = 'error', // 'error' | 'warning' | 'info'
  className = '',
}) => {
  if (!message) return null;

  const severityStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
    },
  };

  const styles = severityStyles[severity] || severityStyles.error;

  return (
    <div
      className={`${styles.bg} ${styles.border} border-l-4 p-4 rounded ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        {/* Icon */}
        <svg
          className={`w-5 h-5 ${styles.icon} mt-0.5 mr-3 flex-shrink-0`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-semibold ${styles.text} mb-1`}>{title}</h3>
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 ${styles.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
