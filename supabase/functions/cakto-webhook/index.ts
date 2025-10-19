import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaktoWebhookPayload {
  event: string;
  data: {
    customer_email: string;
    customer_name?: string;
    plan_id?: string;
    status?: string;
    subscription_id?: string;
    expires_at?: string;
    [key: string]: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const payload: CaktoWebhookPayload = await req.json();
    console.log('Received Cakto webhook:', payload);

    const { event, data } = payload;
    const customerEmail = data.customer_email;

    if (!customerEmail) {
      throw new Error('Email do cliente não fornecido');
    }

    // Buscar usuário pelo email
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Erro ao buscar usuários:', authError);
      throw authError;
    }

    const user = authUser.users.find(u => u.email === customerEmail);

    if (!user) {
      console.log('Usuário não encontrado, email:', customerEmail);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Usuário não encontrado. O usuário precisa se cadastrar primeiro.' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mapear eventos da Cakto
    let subscriptionStatus: 'active' | 'cancelled' | 'expired' = 'active';
    let planType: 'basic' | 'pro' = 'basic';

    switch (event) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'payment.approved':
        subscriptionStatus = 'active';
        // Mapear plan_id da Cakto para seu sistema
        planType = data.plan_id?.toLowerCase().includes('pro') ? 'pro' : 'basic';
        break;
      
      case 'subscription.cancelled':
        subscriptionStatus = 'cancelled';
        break;
      
      case 'subscription.expired':
        subscriptionStatus = 'expired';
        break;
      
      default:
        console.log('Evento não tratado:', event);
        return new Response(
          JSON.stringify({ success: true, message: 'Evento recebido mas não processado' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Verificar se já existe assinatura ativa
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    let result;

    if (existingSubscription) {
      // Atualizar assinatura existente
      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: planType,
          status: subscriptionStatus,
          stripe_subscription_id: data.subscription_id || existingSubscription.stripe_subscription_id,
          expires_at: data.expires_at || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = { updated };
      console.log('Assinatura atualizada:', updated);
    } else {
      // Criar nova assinatura
      const { data: created, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: subscriptionStatus,
          stripe_subscription_id: data.subscription_id,
          expires_at: data.expires_at || null,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;
      result = { created };
      console.log('Nova assinatura criada:', created);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso',
        data: result 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
