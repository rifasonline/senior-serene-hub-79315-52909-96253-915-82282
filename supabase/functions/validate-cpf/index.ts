import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cpf } = await req.json();

    if (!cpf) {
      return new Response(
        JSON.stringify({ valid: false, error: 'CPF não fornecido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Remove formatting from CPF
    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      return new Response(
        JSON.stringify({ valid: false, error: 'CPF deve ter 11 dígitos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Validating CPF: ${cleanCpf}`);

    // Call BrasilAPI to validate CPF
    const response = await fetch(`https://brasilapi.com.br/api/cpf/v1/${cleanCpf}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('CPF validation successful:', data);
      
      return new Response(
        JSON.stringify({ 
          valid: true, 
          data: {
            cpf: data.cpf,
            valid: data.valid
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else if (response.status === 404) {
      console.log('CPF not found in database');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'CPF não encontrado na base de dados da Receita Federal' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.error('BrasilAPI error:', response.status);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Erro ao validar CPF. Tente novamente.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in validate-cpf function:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Erro ao validar CPF. Verifique sua conexão e tente novamente.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
