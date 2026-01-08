import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * ErrorBoundaryDemo - Interactive demo to test error boundaries
 *
 * USAGE: Add this to your dashboard to test error handling
 *
 * This component lets you trigger different types of errors to see how
 * the ErrorBoundary catches and handles them.
 */

// Component that throws an error on demand
const BuggyComponent = ({ shouldThrow, errorType }) => {
  if (shouldThrow) {
    if (errorType === 'render') {
      throw new Error('Render error: Component crashed during render!');
    }
    if (errorType === 'null') {
      const obj = null;
      return <div>{obj.property}</div>; // Will throw TypeError
    }
    if (errorType === 'undefined') {
      const obj = undefined;
      return <div>{obj.map(x => x)}</div>; // Will throw TypeError
    }
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <p className="text-green-700 font-semibold">
        ✅ Component is working fine!
      </p>
      <p className="text-sm text-green-600 mt-1">
        No errors detected. Click a button above to trigger an error.
      </p>
    </div>
  );
};

const ErrorBoundaryDemo = () => {
  const [triggerError, setTriggerError] = useState(false);
  const [errorType, setErrorType] = useState('render');
  const [key, setKey] = useState(0); // Used to reset the error boundary

  const handleTriggerError = (type) => {
    setErrorType(type);
    setTriggerError(true);
  };

  const handleReset = () => {
    setTriggerError(false);
    setKey(k => k + 1); // Change key to force remount and reset ErrorBoundary
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          🛡️ Error Boundary Demo
        </h2>
        <p className="text-gray-600 mb-6">
          Test how error boundaries catch and handle component errors gracefully.
        </p>

        <div className="space-y-3 mb-6">
          <p className="text-sm font-semibold text-gray-700">
            Click a button to trigger an error:
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTriggerError('render')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Throw Render Error
            </button>

            <button
              onClick={() => handleTriggerError('null')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Null Reference Error
            </button>

            <button
              onClick={() => handleTriggerError('undefined')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Undefined Error
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Component Status:
          </h3>

          {/* Error Boundary wraps the buggy component */}
          <ErrorBoundary key={key}>
            <BuggyComponent shouldThrow={triggerError} errorType={errorType} />
          </ErrorBoundary>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            💡 What's Happening?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Without error boundaries, errors would crash the entire app
            </li>
            <li>
              The ErrorBoundary catches errors and shows a fallback UI
            </li>
            <li>
              Users can recover by clicking "Try Again" or going home
            </li>
            <li>
              In production, errors would be logged to monitoring services
            </li>
          </ul>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <strong>Note:</strong> Error boundaries only catch errors during rendering,
          lifecycle methods, and constructors. They don't catch errors in event
          handlers, async code, or server-side rendering.
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryDemo;
