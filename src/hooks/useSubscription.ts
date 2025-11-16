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
      setSubscription(prev => ({ ...prev, loading: true }));
      
      const timeoutId = setTimeout(() => {
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

        if (error) {
          setSubscription({
            plan: null,
            isActive: false,
            features: getFeatures(null),
            loading: false,
          });
          return;
        }

        if (!data) {
          setSubscription({
            plan: null,
            isActive: false,
            features: getFeatures(null),
            loading: false,
          });
          return;
        }

        const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
        const isActive = data.status === 'active' && !isExpired;
        const plan: PlanType = isActive ? (data.plan_type as PlanType) : null;

        setSubscription({
          plan,
          isActive,
          features: getFeatures(plan),
          loading: false,
        });
      } catch (err) {
        clearTimeout(timeoutId);
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
