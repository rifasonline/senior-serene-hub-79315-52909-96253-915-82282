import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao CuidaBem! 🎉
          </h1>
          <p className="text-gray-600">
            Vamos configurar sua conta para começar a cuidar melhor.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Criar perfil do idoso</h3>
              <p className="text-sm text-gray-600 mt-1">
                Adicione informações básicas da pessoa que você cuida
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Adicionar medicamentos</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure os medicamentos principais e horários
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Contatos de emergência</h3>
              <p className="text-sm text-gray-600 mt-1">
                Defina quem deve ser notificado em caso de emergência
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/app/dashboard')} 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Começar Agora
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            Você poderá configurar tudo isso depois no menu Perfil
          </p>
        </div>
      </div>
    </div>
  );
}
