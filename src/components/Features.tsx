import { Calendar, Bell, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import agendaImage from "@/assets/feature-agenda.jpg";
import alertsImage from "@/assets/feature-alerts.jpg";
import activitiesImage from "@/assets/feature-activities.jpg";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Gerencie medicamentos, consultas médicas e compromissos com lembretes automáticos personalizados.",
      image: agendaImage,
      color: "primary",
    },
    {
      icon: Bell,
      title: "Alertas de Saúde",
      description: "Monitoramento contínuo de condições médicas e alertas sobre mudanças de comportamento e estado emocional.",
      image: alertsImage,
      color: "accent",
    },
    {
      icon: Activity,
      title: "Atividades Personalizadas",
      description: "Sugestões de atividades cognitivas e físicas adaptadas às preferências e necessidades do idoso.",
      image: activitiesImage,
      color: "secondary",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-foreground">Funcionalidades Principais</h2>
          <p className="text-lg text-muted-foreground">
            Tudo que você precisa para oferecer o melhor cuidado, 
            reunido em um único aplicativo intuitivo e fácil de usar.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border bg-card shadow-card hover:shadow-elegant transition-smooth overflow-hidden hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 space-y-6">
                {/* Image */}
                <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden bg-muted">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                  />
                </div>

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg gradient-${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
