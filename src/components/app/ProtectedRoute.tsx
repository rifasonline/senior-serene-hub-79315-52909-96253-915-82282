import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

export const ProtectedRoute = ({ children, requireSubscription = true }: ProtectedRouteProps) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const subscription = useSubscription(user);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => authSubscription.unsubscribe();
  }, []);

  // Show loading state
  if (loading || subscription.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but no subscription required - allow access
  if (!requireSubscription) {
    return <>{children}</>;
  }

  // Check subscription requirement
  if (!subscription.isActive) {
    return <Navigate to="/auth" state={{ message: "Você precisa de uma assinatura ativa para acessar esta área." }} replace />;
  }

  return <>{children}</>;
};
