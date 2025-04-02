import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { currentUser } = useAuth();

  console.log('PrivateRoute Debug:', {
    currentUser,
    adminOnly,
    isAdmin: currentUser?.isAdmin,
    userData: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      isAdmin: currentUser.isAdmin,
      fullUser: currentUser
    } : null
  });

  if (!currentUser) {
    console.log('No current user - redirecting to login');
    return <Navigate to="/login" />;
  }

  if (adminOnly) {
    console.log('Admin check:', {
      adminOnly,
      userIsAdmin: currentUser.isAdmin,
      currentUser: currentUser
    });
    
    if (!currentUser.isAdmin) {
      console.log('Admin access denied - user is not admin');
      return <Navigate to="/" />;
    }
    
    console.log('Admin access granted');
  }

  return children;
};

export default PrivateRoute; 