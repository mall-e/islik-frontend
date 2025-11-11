import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('=== PROTECTED ROUTE ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('loading:', loading);

  if (loading) {
    console.log('Showing loading screen...');

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to /login...');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content...');
  return <>{children}</>;
};

export default ProtectedRoute;