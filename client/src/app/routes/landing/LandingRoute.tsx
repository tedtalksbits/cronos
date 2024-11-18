import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

export const LandingRoute = ({ redirectTo }: { redirectTo: string }) => {
  const { user, loading } = useAuth();

  const location = useLocation();
  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to={redirectTo} state={{ from: location }} />;
  }

  return <Navigate to='/login' state={{ from: location }} />;
};
