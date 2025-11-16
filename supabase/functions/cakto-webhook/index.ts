import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaktoWebhookPayload {
  event: string;
  data: {
    id?: string;
    customer?: {
      email: string;
      name?: string;
      phone?: string;
      docNumber?: string;
    };
    offer?: {
      id?: string;
      name?: string;
      price?: number;
    };
    product?: {
      name?: string;
      id?: string;
    };
    status?: string;
    amount?: number;
    paidAt?: string;
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
    const customerEmail = data.customer?.email;

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
    let isRefundOrCancellation = false;
    let expiresAt: string | null = null;

    switch (event) {
      case 'purchase_approved':
      case 'pix_paid':
      case 'payment.approved':
        subscriptionStatus = 'active';
        // Mapear produto/oferta da Cakto para plano
        const productName = data.product?.name?.toLowerCase() || '';
        const offerName = data.offer?.name?.toLowerCase() || '';
        
        // Verifica se é PRO (contém "pro" no nome) ou Básico
        if (productName.includes('pro') || offerName.includes('pro')) {
          planType = 'pro';
        } else {
          planType = 'basic';
        }
        
        // Para compras únicas, definir expiração de 30 dias
        // Para subscriptions recorrentes, o Cakto envia eventos de renovação
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        expiresAt = thirtyDaysFromNow.toISOString();
        
        console.log(`Plano identificado: ${planType} para produto "${data.product?.name}", expira em: ${expiresAt}`);
        break;
      
      case 'subscription.created':
      case 'subscription.updated':
        subscriptionStatus = 'active';
        const subProductName = data.product?.name?.toLowerCase() || '';
        const subOfferName = data.offer?.name?.toLowerCase() || '';
        
        if (subProductName.includes('pro') || subOfferName.includes('pro')) {
          planType = 'pro';
        } else {
          planType = 'basic';
        }
        
        // Subscriptions recorrentes têm renovação automática, não precisam de expires_at
        expiresAt = null;
        console.log(`Subscription recorrente ${planType} criada/atualizada para ${customerEmail}`);
        break;
      
      case 'subscription.cancelled':
      case 'purchase_refunded':
      case 'refund.created':
      case 'charge_refunded':
      case 'payment.failed':
      case 'subscription.payment_failed':
        console.log(`Processando reembolso/cancelamento/falha de pagamento para usuário: ${customerEmail}`);
        subscriptionStatus = 'cancelled';
        isRefundOrCancellation = true;
        // Marcar como expirado imediatamente
        expiresAt = new Date().toISOString();
        break;
      
      case 'subscription.expired':
        subscriptionStatus = 'expired';
        isRefundOrCancellation = true;
        expiresAt = new Date().toISOString();
        break;
      
      default:
        console.log('Evento não tratado:', event);
        return new Response(
          JSON.stringify({ success: true, message: 'Evento recebido mas não processado' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Para reembolsos/cancelamentos, buscar qualquer subscription do usuário (não apenas ativa)
    const query = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);
    
    // Se não for reembolso/cancelamento, buscar apenas ativa
    if (!isRefundOrCancellation) {
      query.eq('status', 'active');
    }
    
    const { data: existingSubscription } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let result;

    if (existingSubscription) {
      // Atualizar assinatura existente
      const updateData: any = {
        status: subscriptionStatus,
        updated_at: new Date().toISOString()
      };

      // Se for reembolso/cancelamento, manter o plano atual e não sobrescrever
      if (isRefundOrCancellation) {
        console.log(`Removendo acesso - Status: ${subscriptionStatus}, Plano: ${existingSubscription.plan_type}`);
        updateData.expires_at = expiresAt; // Marca como expirada imediatamente
      } else {
        // Para ativações, atualizar o plano e data de expiração
        updateData.plan_type = planType;
        updateData.stripe_subscription_id = data.id || existingSubscription.stripe_subscription_id;
        updateData.expires_at = expiresAt;
      }

      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = { updated };
      console.log('Assinatura atualizada:', updated);
    } else {
      // Apenas criar nova assinatura se NÃO for reembolso/cancelamento
      if (isRefundOrCancellation) {
        console.log('Evento de reembolso/cancelamento mas nenhuma assinatura encontrada para remover.');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Nenhuma assinatura encontrada para cancelar' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Criar nova assinatura apenas para eventos de ativação
      const { data: created, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: subscriptionStatus,
          stripe_subscription_id: data.id,
          expires_at: expiresAt,
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
