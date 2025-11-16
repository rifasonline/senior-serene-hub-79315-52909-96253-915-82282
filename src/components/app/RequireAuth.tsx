import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, subscription } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!subscription.isActive) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
