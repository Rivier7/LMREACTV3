import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Warning threshold: show warning 5 minutes before expiration
const EXPIRATION_WARNING_MS = 5 * 60 * 1000;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);

  // Function to check if token is expired
  const isTokenExpired = jwt => {
    try {
      const decoded = jwtDecode(jwt);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Function to get time until expiration
  const getTimeUntilExpiration = jwt => {
    try {
      const decoded = jwtDecode(jwt);
      return decoded.exp * 1000 - Date.now();
    } catch {
      return 0;
    }
  };

  const login = jwt => {
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setShowExpirationWarning(false);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken('');
    setShowExpirationWarning(false);
  }, []);

  // Check for token expiration and set up warning timer
  useEffect(() => {
    if (!token) return;

    if (isTokenExpired(token)) {
      logout();
      return;
    }

    const timeUntilExpiration = getTimeUntilExpiration(token);

    // Set up warning timer (5 minutes before expiration)
    const warningTime = timeUntilExpiration - EXPIRATION_WARNING_MS;
    let warningTimer;
    if (warningTime > 0) {
      warningTimer = setTimeout(() => {
        setShowExpirationWarning(true);
      }, warningTime);
    } else if (timeUntilExpiration > 0) {
      // Less than 5 minutes remaining, show warning immediately
      setShowExpirationWarning(true);
    }

    // Set up logout timer
    const logoutTimer = setTimeout(() => {
      logout();
    }, timeUntilExpiration);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, [token, logout]);

  const isAuthenticated = !!token && !isTokenExpired(token);

  const dismissExpirationWarning = () => {
    setShowExpirationWarning(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated,
        showExpirationWarning,
        dismissExpirationWarning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
