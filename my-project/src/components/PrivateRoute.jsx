// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading spinner component for auth check
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-3"></div>
        <p className="text-gray-600 text-sm">Verifying authentication...</p>
      </div>
    </div>
  );
}

export default function PrivateRoute({ children }) {
  const { token, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (token === null) {
    return <AuthLoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}
