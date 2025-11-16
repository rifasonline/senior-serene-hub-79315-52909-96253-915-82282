import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type PlanType = 'basic' | 'pro' | null;

export interface SubscriptionFeatures {
  hasSOSButton: boolean;
  hasUnlimitedHistory: boolean;
  hasMultipleProfiles: boolean;
  hasReports: boolean;
  maxProfiles: number;
}

export interface Subscription {
  plan: PlanType;
  isActive: boolean;
  features: SubscriptionFeatures;
  loading: boolean;
}

const getFeatures = (plan: PlanType): SubscriptionFeatures => {
  if (plan === 'pro') {
    return {
      hasSOSButton: true,
      hasUnlimitedHistory: true,
      hasMultipleProfiles: true,
      hasReports: true,
      maxProfiles: 5,
    };
  }
  
  if (plan === 'basic') {
    return {
      hasSOSButton: false,
      hasUnlimitedHistory: false,
      hasMultipleProfiles: false,
      hasReports: false,
      maxProfiles: 1,
    };
  }
  
  return {
    hasSOSButton: false,
    hasUnlimitedHistory: false,
    hasMultipleProfiles: false,
    hasReports: false,
    maxProfiles: 0,
  };
};

export const useSubscription = (user: User | null): Subscription => {
  const [subscription, setSubscription] = useState<Subscription>({
    plan: null,
    isActive: false,
    features: getFeatures(null),
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setSubscription({
        plan: null,
        isActive: false,
        features: getFeatures(null),
        loading: false,
      });
      return;
    }

    const fetchSubscription = async () => {
      console.log('[useSubscription] Buscando assinatura para user:', user.id);
      
      // Timeout de segurança
      const timeoutId = setTimeout(() => {
        console.warn('[useSubscription] Timeout atingido (5s), forçando loading = false');
        setSubscription({
          plan: null,
          isActive: false,
          features: getFeatures(null),
          loading: false,
        });
      }, 5000);
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan_type, status, expires_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        clearTimeout(timeoutId);
        console.log('[useSubscription] Resultado da query:', { data, error });

        if (error) {
          console.error('[useSubscription] Erro na query:', error);
          setSubscription({
            plan: null,
            isActive: false,
            features: getFeatures(null),
            loading: false,
          });
          return;
        }

        if (!data) {
          console.log('[useSubscription] Nenhuma assinatura ativa encontrada');
          setSubscription({
            plan: null,
            isActive: false,
            features: getFeatures(null),
            loading: false,
          });
          return;
        }

        // Verificar se está expirada
        const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
        console.log('[useSubscription] Dados da assinatura:', {
          plan_type: data.plan_type,
          status: data.status,
          expires_at: data.expires_at,
          isExpired
        });
        
        // Se o status é 'active' e não expirou, então está ativa
        const isActive = data.status === 'active' && !isExpired;
        const plan: PlanType = isActive ? (data.plan_type as PlanType) : null;

        console.log('[useSubscription] Estado final:', { plan, isActive });

        setSubscription({
          plan,
          isActive,
          features: getFeatures(plan),
          loading: false,
        });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('[useSubscription] Erro ao buscar assinatura:', err);
        setSubscription({
          plan: null,
          isActive: false,
          features: getFeatures(null),
          loading: false,
        });
      }
    };

    fetchSubscription();

    // Subscribe to subscription changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return subscription;
};
