import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Pricing = () => {
  const plans = [
    {
      name: "Plano Básico",
      price: "29,90",
      popular: false,
      description: "Ideal para começar a cuidar com organização e lembretes essenciais.",
      features: [
        "Agenda de medicamentos",
        "Lembretes personalizados",
        "Gerenciamento de compromissos",
        "Suporte por email",
        "Histórico de 30 dias",
      ],
    },
    {
      name: "Plano Pro",
      price: "49,90",
      popular: true,
      badge: "Mais Popular",
      description: "Cuidado completo com monitoramento avançado e suporte prioritário.",
      features: [
        "Tudo do Plano Básico",
        "Botão de emergência",
        "Alertas de saúde inteligentes",
        "Monitoramento comportamental",
        "Atividades personalizadas",
        "Telemedicina integrada",
        "Relatórios médicos em PDF",
        "Atendimento preferencial",
        "Histórico ilimitado",
        "Múltiplos perfis de idosos",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-foreground mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para suas necessidades de cuidado
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center pt-10">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "flex flex-col relative rounded-2xl lg:rounded-3xl transition-all bg-card items-start w-full border overflow-hidden",
                plan.popular 
                  ? "md:scale-110 border-2 border-primary shadow-elegant z-10 mt-4" 
                  : "border-border shadow-card hover:shadow-soft"
              )}
            >
              {plan.popular && (
                <>
                  {/* Badge Mais Comprado - Bem Acima do Card */}
                  <motion.div
                    initial={{ opacity: 0, y: -30, scale: 0.8 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1
                    }}
                    className="absolute -top-20 left-1/2 -translate-x-1/2 z-30"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary blur-xl opacity-60 animate-pulse"></div>
                      <div className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-base shadow-glow border-2 border-white/20">
                        <span className="text-xl">⭐</span>
                        <span className="whitespace-nowrap">MAIS COMPRADO</span>
                        <span className="text-xl">⭐</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Badge Melhor Custo-Benefício */}
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5,
                      delay: 0.25
                    }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
                  >
                    {plan.badge && (
                      <div className="px-5 py-2 rounded-full bg-accent/90 backdrop-blur-sm border border-accent shadow-soft">
                        <span className="text-xs font-bold text-accent-foreground whitespace-nowrap">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="absolute top-1/2 inset-x-0 mx-auto h-12 -rotate-45 w-full bg-primary/30 rounded-2xl lg:rounded-3xl blur-[8rem] -z-10"></div>
                </>
              )}

              <div className="p-4 md:p-8 flex rounded-t-2xl lg:rounded-t-3xl flex-col items-start w-full relative">
                <h3 className={cn(
                  "font-bold text-foreground mb-2",
                  plan.popular ? "text-3xl" : "text-2xl"
                )}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "font-bold text-primary",
                    plan.popular ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"
                  )}>
                    R${plan.price}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>

              <div className="flex flex-col items-start w-full px-4 py-2 md:px-8">
                <Button
                  variant={plan.popular ? "hero" : "default"}
                  size="lg"
                  className={cn(
                    "w-full group font-semibold",
                    plan.popular && "text-lg"
                  )}
                  onClick={() => window.open('https://play.google.com', '_blank')}
                >
                  {plan.popular ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Assinar Plano Pro
                    </>
                  ) : (
                    "Começar Agora"
                  )}
                  <ArrowRight className="ml-2 h-5 w-5 transition-smooth group-hover:translate-x-1" />
                </Button>
              </div>

              <div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-2">
                <span className="text-base text-left mb-2 font-medium">
                  Inclui:
                </span>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-start gap-2">
                    <div className="flex items-center justify-center">
                      <Check className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
