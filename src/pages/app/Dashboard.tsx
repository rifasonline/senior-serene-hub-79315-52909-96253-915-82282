import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useSubscription } from '@/hooks/useSubscription';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const subscription = useSubscription(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Cuidados</h1>
          <p className="text-gray-600 mt-2">
            Plano: <span className="font-semibold capitalize">{subscription.plan || 'Nenhum'}</span>
          </p>
        </header>

        <div className="grid gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Bem-vindo ao CuidaBem App!</h2>
            <p className="text-gray-600">
              Este é o painel principal onde você gerenciará os cuidados com seu idoso.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📱 <strong>Em breve:</strong> Agenda de medicamentos, compromissos, tarefas diárias e muito mais!
              </p>
            </div>
          </div>

          {subscription.features.hasSOSButton && (
            <div className="bg-red-50 rounded-2xl shadow-sm p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-red-900">🚨 Botão SOS Ativo</h3>
              <p className="text-red-700 text-sm mt-2">
                Recurso exclusivo do Plano Pro - Em breve disponível!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
