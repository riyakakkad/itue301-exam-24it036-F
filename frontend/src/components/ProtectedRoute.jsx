import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * - If user is not authenticated (missing token): redirects to '/' (LoginPage)
 * - If requiredRole is specified and user's role does not match: redirects to '/events'
 * (keeps the redirect targets distinct for easy viva demonstration)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  // Case 1: Missing authentication -> redirect to LoginPage ('/')
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Case 2: Role mismatch -> redirect to EventsPage ('/events') without logging out
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/events" replace />;
  }

  return children;
};

export default ProtectedRoute;
