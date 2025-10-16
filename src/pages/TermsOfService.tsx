import { FileCheck, AlertCircle, Users, CreditCard, Shield, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  const sections = [
    {
      icon: FileCheck,
      title: "1. Aceitação dos Termos",
      content: [
        "Ao criar uma conta ou utilizar o CuidaBem, você concorda com estes Termos de Uso",
        "Se você não concordar com algum termo, não utilize nossos serviços",
        "Reservamos o direito de modificar estes termos a qualquer momento",
        "Mudanças significativas serão comunicadas com 30 dias de antecedência",
        "O uso contínuo após alterações constitui aceitação dos novos termos",
      ],
    },
    {
      icon: Users,
      title: "2. Elegibilidade e Conta",
      content: [
        "Você deve ter 18 anos ou mais para criar uma conta",
        "Menores podem usar o serviço sob supervisão de responsável legal",
        "Você é responsável por manter a confidencialidade de sua senha",
        "Você deve fornecer informações verdadeiras e atualizadas",
        "Uma conta por pessoa - contas duplicadas podem ser encerradas",
        "Você é responsável por todas as atividades realizadas em sua conta",
      ],
    },
    {
      icon: Shield,
      title: "3. Uso do Serviço",
      content: [
        "O CuidaBem é uma ferramenta de apoio ao cuidado, não substitui orientação médica profissional",
        "Você deve sempre consultar profissionais de saúde para decisões médicas",
        "Não utilize o serviço para emergências - ligue 192 (SAMU) em emergências",
        "Proibido compartilhar conteúdo ilegal, ofensivo ou prejudicial",
        "Proibido usar o serviço para fins comerciais não autorizados",
        "Nos reservamos o direito de suspender contas que violem estes termos",
      ],
    },
    {
      icon: AlertCircle,
      title: "4. Limitações de Responsabilidade",
      content: [
        "O serviço é fornecido 'como está' sem garantias expressas ou implícitas",
        "Não garantimos que o serviço será ininterrupto ou livre de erros",
        "Não nos responsabilizamos por decisões médicas baseadas unicamente no app",
        "Não somos responsáveis por falhas de internet ou dispositivos de terceiros",
        "Nossa responsabilidade máxima é limitada ao valor pago nos últimos 12 meses",
        "Em caso de falha nos lembretes, não nos responsabilizamos por medicamentos não tomados",
      ],
    },
    {
      icon: CreditCard,
      title: "5. Pagamentos e Assinaturas",
      content: [
        "Planos são cobrados mensalmente de forma recorrente",
        "Você pode cancelar sua assinatura a qualquer momento",
        "Cancelamentos têm efeito no próximo ciclo de cobrança",
        "Não há reembolso proporcional em caso de cancelamento",
        "Preços podem ser alterados com notificação de 30 dias",
        "Falhas de pagamento podem resultar em suspensão do serviço",
      ],
    },
    {
      icon: Scale,
      title: "6. Propriedade Intelectual",
      content: [
        "Todo conteúdo do CuidaBem é protegido por direitos autorais",
        "Você mantém direitos sobre seus dados pessoais e de saúde",
        "Concedemos a você uma licença limitada e não exclusiva de uso",
        "Proibida a cópia, modificação ou distribuição não autorizada do app",
        "Nosso nome, logo e marcas são propriedades protegidas",
        "Feedback e sugestões podem ser utilizados sem compensação",
      ],
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex p-4 rounded-full gradient-primary mb-4">
            <FileCheck className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-foreground">Termos de Uso</h1>
          <p className="text-lg text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Estes Termos de Uso regem sua utilização do CuidaBem e dos serviços relacionados. 
            Leia atentamente antes de utilizar nosso aplicativo.
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
                  <div className="inline-flex p-3 rounded-lg gradient-secondary flex-shrink-0">
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
                      <span className="text-secondary mt-1 flex-shrink-0">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <Card className="mt-12 border-primary/30 bg-gradient-subtle">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                Aviso Importante
              </h3>
              <p className="text-muted-foreground">
                O CuidaBem é uma ferramenta de apoio e organização do cuidado com idosos. 
                Não substitui consultas, diagnósticos ou tratamentos médicos profissionais.
              </p>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 space-y-2">
              <p className="font-semibold text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Em caso de emergência médica
              </p>
              <p className="text-sm text-muted-foreground">
                Não utilize o aplicativo. Ligue imediatamente para:
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <span>SAMU: 192</span>
                <span>|</span>
                <span>Bombeiros: 193</span>
                <span>|</span>
                <span>Polícia: 190</span>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Dúvidas sobre os Termos de Uso?
              </p>
              <a 
                href="/contact" 
                className="text-primary hover:underline font-semibold"
              >
                Entre em contato conosco
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mt-8 border-border bg-card">
          <CardContent className="p-6">
            <h4 className="font-semibold text-foreground mb-3">Lei Aplicável e Foro</h4>
            <p className="text-sm text-muted-foreground">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
              Qualquer disputa será resolvida no foro da comarca de São Paulo - SP, 
              com exclusão de qualquer outro, por mais privilegiado que seja.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
