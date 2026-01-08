import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PageErrorFallback - Specialized error UI for page-level errors
 *
 * Shows a more contextual error message for page-specific failures
 */
const PageErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (resetError) resetError();
    navigate('/dashboard');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-xl p-8">
        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
          Page Error
        </h1>

        <p className="text-gray-600 text-center mb-6 text-lg">
          This page encountered an error and couldn't be displayed.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">What you can do:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try reloading the page</li>
                <li>Go back to the dashboard</li>
                <li>Check your internet connection</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Show error details in development */}
        {import.meta.env.DEV && error && (
          <details className="mb-6 p-4 bg-gray-100 rounded-lg text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700">
              Technical Details (Dev Mode)
            </summary>
            <pre className="mt-2 text-xs overflow-auto bg-white p-3 rounded max-h-40 text-red-600">
              {error.toString()}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReload}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Reload Page
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Error ID: {Date.now().toString(36).toUpperCase()}
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Please include this ID when contacting support
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageErrorFallback;
