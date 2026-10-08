import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import UnauthorizedPage from '../../pages/auth/UnauthorizedPage';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <UnauthorizedPage requiredRoles={allowedRoles} />;
  }

  return children;
}
