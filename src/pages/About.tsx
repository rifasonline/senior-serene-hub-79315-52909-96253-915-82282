import { Heart, Target, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";

const About = () => {
  const { count: cuidadoresCount, ref: cuidadoresRef } = useCountUp({ end: 10000, duration: 2500 });
  const { count: medicamentosCount, ref: medicamentosRef } = useCountUp({ end: 50000, duration: 2500 });
  const { count: avaliacaoCount, ref: avaliacaoRef } = useCountUp({ end: 4.9, duration: 2500, decimals: 1 });

  const values = [
    {
      icon: Heart,
      title: "Cuidado e Empatia",
      description: "Desenvolvemos soluções pensando no bem-estar de cuidadores e idosos",
    },
    {
      icon: Target,
      title: "Simplicidade",
      description: "Tecnologia acessível e fácil de usar para todas as idades",
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Apoiamos e conectamos cuidadores em toda sua jornada",
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Comprometidos com a qualidade e melhoria contínua",
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-foreground">Sobre o CuidaBem</h1>
          <p className="text-lg text-muted-foreground">
            Nossa missão é facilitar o cuidado com idosos através de tecnologia 
            acessível, promovendo bem-estar e qualidade de vida.
          </p>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="border-border bg-card shadow-card">
            <CardContent className="p-8 md:p-12 space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Nossa Missão</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                O CuidaBem nasceu da necessidade de simplificar a rotina de milhões de cuidadores 
                que dedicam suas vidas ao bem-estar de idosos. Acreditamos que a tecnologia pode 
                e deve ser uma aliada no cuidado, proporcionando mais tempo de qualidade entre 
                cuidadores e idosos.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Desenvolvemos um aplicativo completo que reúne todas as ferramentas necessárias 
                para organizar medicamentos, monitorar saúde, agendar consultas e muito mais, 
                tudo de forma intuitiva e acessível.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold text-center text-foreground mb-12">
            Nossos Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="border-border bg-card shadow-card hover:shadow-soft transition-smooth text-center"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-primary/10">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="gradient-hero rounded-3xl p-12 md:p-16 shadow-elegant">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-center text-primary-foreground mb-12">
              Nosso Impacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2" ref={cuidadoresRef}>
                <p className="text-5xl font-bold text-primary-foreground">
                  {cuidadoresCount.toLocaleString('pt-BR')}+
                </p>
                <p className="text-lg text-primary-foreground/90">Cuidadores Ativos</p>
              </div>
              <div className="space-y-2" ref={medicamentosRef}>
                <p className="text-5xl font-bold text-primary-foreground">
                  {medicamentosCount.toLocaleString('pt-BR')}+
                </p>
                <p className="text-lg text-primary-foreground/90">Medicamentos Gerenciados</p>
              </div>
              <div className="space-y-2" ref={avaliacaoRef}>
                <p className="text-5xl font-bold text-primary-foreground">
                  {avaliacaoCount.toFixed(1)}/5
                </p>
                <p className="text-lg text-primary-foreground/90">Avaliação dos Usuários</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
