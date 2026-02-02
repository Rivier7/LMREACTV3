import { useAuth } from '../context/AuthContext';

export default function SessionExpirationWarning() {
  const { showExpirationWarning, dismissExpirationWarning, logout } = useAuth();

  if (!showExpirationWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">
            Your session will expire soon. Please save your work.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={dismissExpirationWarning}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
          <button
            onClick={logout}
            className="bg-white text-amber-600 px-3 py-1 rounded text-sm font-medium hover:bg-amber-50"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
