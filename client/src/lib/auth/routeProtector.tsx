import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { Navigate } from 'react-router-dom';

export const RouteProtector = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to='/login' />;
  return <>{children}</>;
};
