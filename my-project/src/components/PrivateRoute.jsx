// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { token, isAuthenticated } = useAuth(); // ✅ get from context

  // Optional: prevent flicker if token is still loading
  if (token === null) return null; // or a loading spinner

  return isAuthenticated ? children : <Navigate to="/login" />;
}
