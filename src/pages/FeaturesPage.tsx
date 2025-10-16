import { Calendar, Activity, Stethoscope, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FeaturesPage = () => {
  const featureDetails = [
    {
      icon: Calendar,
      title: "Agenda Completa",
      description: "Organize toda a rotina de cuidados em um só lugar",
      items: [
        "Lembretes de medicamentos com horários personalizados",
        "Agendamento de consultas médicas",
        "Controle de doses e prescrições",
        "Sincronização com calendário",
      ],
      color: "primary",
    },
    {
      icon: Activity,
      title: "Atividades Personalizadas",
      description: "Promova bem-estar físico e mental",
      items: [
        "Exercícios físicos adaptados",
        "Jogos cognitivos e memória",
        "Atividades sociais sugeridas",
        "Acompanhamento de progresso",
      ],
      color: "secondary",
    },
    {
      icon: Stethoscope,
      title: "Consultas Médicas",
      description: "Facilite o acesso a profissionais de saúde",
      items: [
        "Agendamento online",
        "Telemedicina integrada",
        "Histórico médico completo",
        "Relatórios para especialistas",
      ],
      color: "primary",
    },
    {
      icon: HeartPulse,
      title: "Monitoramento de Saúde",
      description: "Acompanhe a saúde de forma contínua",
      items: [
        "Registro de sinais vitais",
        "Gráficos e tendências",
        "Alertas preventivos",
        "Compartilhamento com médicos",
      ],
      color: "secondary",
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-foreground">Funcionalidades Completas</h1>
          <p className="text-lg text-muted-foreground">
            Descubra todas as ferramentas que o CuidaBem oferece para facilitar 
            e melhorar a rotina de cuidados com idosos.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureDetails.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border bg-card shadow-card hover:shadow-soft transition-smooth"
            >
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg gradient-${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
