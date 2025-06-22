// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Debug:', {
    user,
    isAuthenticated,
    requiredRole,
    userRole: user?.role,
    loading
  });


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

if (requiredRole) {
    const userRole = user?.role;
    
    // Convert both to numbers for comparison
    const userRoleNum = Number(userRole);
    const requiredRoleNum = Number(requiredRole);
    
    console.log('Role comparison:', { userRoleNum, requiredRoleNum });
    
    if (userRoleNum !== requiredRoleNum) {
      // Redirect based on actual user role
      if (userRoleNum === 2) {
        return <Navigate to="/admin/home" replace />;
      } else if (userRoleNum === 1) {
        return <Navigate to="/user/home" replace />;
      } else {
        // Unknown role, redirect to login
        return <Navigate to="/login" replace />;
      }
    }
  }
  return children;
};

export default ProtectedRoute;