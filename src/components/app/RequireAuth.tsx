import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  console.log('[RequireAuth] Estado atual:', {
    loading,
    subscriptionLoading: subscription.loading,
    user: user?.email,
    subscriptionIsActive: subscription.isActive,
    subscriptionPlan: subscription.plan
  });

  if (loading || subscription.loading) {
    console.log('[RequireAuth] Aguardando carregamento...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[RequireAuth] Usuário não autenticado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  if (!subscription.isActive) {
    console.log('[RequireAuth] Assinatura não ativa, redirecionando para /');
    return <Navigate to="/" replace />;
  }

  console.log('[RequireAuth] Acesso autorizado ao dashboard');

  return <>{children}</>;
};
