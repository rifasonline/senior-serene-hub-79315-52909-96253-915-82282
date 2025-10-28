import { useEffect } from "react";
import { Shield, Lock, Eye, UserCheck, FileText, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const sections = [
    {
      icon: FileText,
      title: "1. Informações que Coletamos",
      content: [
        "Dados Pessoais: Nome, email, telefone, endereço e data de nascimento",
        "Dados de Saúde: Informações sobre medicamentos, consultas médicas, condições de saúde e monitoramento de sinais vitais",
        "Dados de Uso: Informações sobre como você utiliza o aplicativo, incluindo horários de acesso e funcionalidades utilizadas",
        "Dados do Dispositivo: Modelo do dispositivo, sistema operacional, identificadores únicos e dados de localização (quando autorizado)",
      ],
    },
    {
      icon: Database,
      title: "2. Como Utilizamos suas Informações",
      content: [
        "Fornecer e melhorar nossos serviços de cuidado com idosos",
        "Enviar lembretes de medicamentos e alertas de saúde personalizados",
        "Facilitar o agendamento de consultas médicas e telemedicina",
        "Gerar relatórios médicos e compartilhar informações com profissionais de saúde autorizados",
        "Melhorar a experiência do usuário através de análise de dados anonimizados",
        "Comunicar atualizações importantes sobre o serviço",
      ],
    },
    {
      icon: Lock,
      title: "3. Proteção de Dados",
      content: [
        "Criptografia de ponta a ponta para dados de saúde sensíveis",
        "Armazenamento seguro em servidores com certificação de segurança",
        "Acesso restrito apenas a funcionários autorizados",
        "Auditorias de segurança regulares",
        "Conformidade com a Lei Geral de Proteção de Dados (LGPD)",
        "Backup automático e recuperação de dados",
      ],
    },
    {
      icon: UserCheck,
      title: "4. Compartilhamento de Informações",
      content: [
        "Profissionais de Saúde: Compartilhamos dados apenas com médicos e profissionais autorizados por você",
        "Prestadores de Serviço: Empresas que nos auxiliam (hospedagem, análise) sob rigorosos acordos de confidencialidade",
        "Exigências Legais: Quando requerido por lei ou para proteger direitos e segurança",
        "Nunca vendemos seus dados pessoais a terceiros",
      ],
    },
    {
      icon: Eye,
      title: "5. Seus Direitos",
      content: [
        "Acesso: Visualizar todos os dados que coletamos sobre você",
        "Correção: Atualizar ou corrigir informações incorretas",
        "Exclusão: Solicitar a remoção completa de seus dados",
        "Portabilidade: Receber seus dados em formato estruturado",
        "Revogação: Retirar consentimento a qualquer momento",
        "Oposição: Opor-se ao processamento de dados em certas situações",
      ],
    },
    {
      icon: Shield,
      title: "6. Retenção de Dados",
      content: [
        "Mantemos seus dados enquanto sua conta estiver ativa",
        "Dados de saúde são mantidos por 20 anos conforme legislação médica brasileira",
        "Você pode solicitar exclusão antecipada através das configurações ou contato",
        "Alguns dados podem ser mantidos por obrigações legais mesmo após exclusão da conta",
      ],
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex p-4 rounded-full gradient-primary mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-foreground">Política de Privacidade</h1>
          <p className="text-lg text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            No CuidaBem, levamos sua privacidade a sério. Esta política explica como coletamos, 
            usamos e protegemos suas informações pessoais e dados de saúde.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card 
              key={index}
              className="border-border bg-card shadow-card hover:shadow-soft transition-smooth"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="inline-flex p-3 rounded-lg gradient-primary flex-shrink-0">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground text-left">
                    {section.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primary mt-1 flex-shrink-0">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 border-primary/30 bg-gradient-subtle">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Dúvidas sobre Privacidade?
            </h3>
            <p className="text-muted-foreground">
              Entre em contato com nosso Encarregado de Proteção de Dados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:privacidade@cuidabem.com.br" 
                className="text-primary hover:underline font-semibold"
              >
                privacidade@cuidabem.com.br
              </a>
              <span className="hidden sm:inline text-muted-foreground">|</span>
              <a 
                href="/contact" 
                className="text-primary hover:underline font-semibold"
              >
                Formulário de Contato
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
