import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, X, Bell, Activity, Video, FileText, Headset, Clock, Users, BookOpen, AlertCircle, Phone, Calendar, BellRing, ClipboardList, Pill, FolderHeart, User, Contrast } from "lucide-react";
import { cn } from "@/lib/utils";

const Pricing = () => {
  const plans = [
    {
      name: "Plano Básico",
      price: "29,90",
      popular: false,
      description: "Ideal para começar a cuidar com organização e lembretes essenciais.",
      features: [
        { name: "Agenda de medicamentos e compromissos médicos", included: true, icon: Calendar },
        { name: "Lembretes automáticos de rotina", included: true, icon: BellRing },
        { name: "Registro diário simples de tarefas", included: true, icon: ClipboardList },
        { name: "Controle de medicamentos", included: true, icon: Pill },
        { name: "Histórico médico simples (consultas e exames)", included: true, icon: FolderHeart },
        { name: "Perfil básico do idoso e do cuidador", included: true, icon: User },
        { name: "Interface acessível com alto contraste", included: true, icon: Contrast },
        { name: "Histórico de 30 dias", included: true, icon: Clock },
        { name: "Botão de emergência", included: false, icon: AlertCircle },
        { name: "Alertas de saúde inteligentes", included: false, icon: Bell },
        { name: "Monitoramento comportamental", included: false, icon: Activity },
        { name: "Telemedicina integrada", included: false, icon: Video },
        { name: "Relatórios médicos em PDF", included: false, icon: FileText },
        { name: "Suporte prioritário", included: false, icon: Headset },
      ],
    },
    {
      name: "Plano Pro",
      price: "49,90",
      popular: true,
      badge: "Mais Popular",
      description: "Cuidado completo com monitoramento avançado e suporte prioritário.",
      showBasicIncluded: true,
      basicSummary: "Tudo do Plano Básico",
      advancedFeatures: [
        { name: "Botão de emergência", included: true, icon: AlertCircle },
        { name: "Alertas de saúde inteligentes", included: true, icon: Bell },
        { name: "Monitoramento comportamental", included: true, icon: Activity },
        { name: "Atividades personalizadas", included: true, icon: Sparkles },
        { name: "Telemedicina integrada", included: true, icon: Video },
        { name: "Relatórios médicos em PDF", included: true, icon: FileText },
        { name: "Atendimento preferencial", included: true, icon: Phone },
        { name: "Histórico ilimitado", included: true, icon: Clock },
        { name: "Múltiplos perfis de idosos", included: true, icon: Users },
        { name: "Suporte prioritário por email", included: true, icon: Headset },
        { name: "Acesso a artigos e conteúdos premium", included: true, icon: BookOpen },
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
                  ? "md:scale-[1.15] border-2 border-primary shadow-elegant z-10" 
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
                        <span className="whitespace-nowrap">MAIS COMPRADO</span>
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
                      <div className="relative">
                        {/* Glow animado ao redor */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-lg opacity-70 animate-pulse"></div>
                        
                        {/* Badge principal */}
                        <div className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 backdrop-blur-sm border-2 border-white/60 shadow-elegant">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-900 animate-pulse" />
                            <span className="text-base font-black text-amber-900 whitespace-nowrap tracking-wide drop-shadow-sm">
                              {plan.badge.toUpperCase()}
                            </span>
                            <Sparkles className="w-5 h-5 text-amber-900 animate-pulse" style={{ animationDelay: '0.5s' }} />
                          </div>
                        </div>
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
                    "w-full group font-semibold relative overflow-hidden",
                    "flex items-center justify-center",
                    "px-3 sm:px-4 md:px-6 lg:px-8",
                    "py-3 sm:py-3.5 md:py-4",
                    "text-sm sm:text-base md:text-lg",
                    "min-h-[48px] sm:min-h-[52px] md:min-h-[56px]",
                    "leading-tight",
                    plan.popular && [
                      "lg:text-xl",
                      "shadow-[0_4px_20px_rgba(var(--primary-rgb),0.4)]",
                      "hover:shadow-[0_6px_30px_rgba(var(--primary-rgb),0.6)]",
                      "hover:scale-[1.02]",
                      "transition-all duration-300",
                      "before:absolute before:inset-0",
                      "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
                      "before:translate-x-[-200%] before:transition-transform before:duration-700",
                      "hover:before:translate-x-[200%]"
                    ]
                  )}
                  onClick={() => window.open(plan.popular ? 'https://pay.cakto.com.br/yd5xq6j_612646' : 'https://pay.cakto.com.br/34vi36u_612634', '_blank')}
                >
                  {plan.popular ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 animate-pulse" />
                      <span className="whitespace-nowrap text-center font-bold">Assinar Plano Pro</span>
                      <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                    </>
                  ) : (
                    <>
                      <span>Começar Agora</span>
                      <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-smooth group-hover:translate-x-1 flex-shrink-0" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-2">
                {plan.showBasicIncluded ? (
                  <>
                    {/* Badge "Tudo do Plano Básico +" */}
                    <div className="w-full mb-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-emerald-950/30 border-2 border-emerald-400/40 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                          <Check className="w-5 h-5 text-white font-bold" />
                        </div>
                        <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                          ✓ {plan.basicSummary} incluído
                        </span>
                      </div>
                    </div>
                    
                    {/* Recursos Avançados Exclusivos */}
                    <div className="w-full mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                      <span className="text-lg font-black text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Recursos Avançados Exclusivos
                      </span>
                    </div>
                    {plan.advancedFeatures?.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-start gap-3 w-full group cursor-default hover:translate-x-1 transition-transform"
                        >
                          <div className={cn(
                            "flex items-center justify-center rounded-full flex-shrink-0 shadow-sm",
                            "w-9 h-9",
                            feature.included 
                              ? "bg-gradient-to-br from-secondary to-secondary/80 group-hover:scale-110 transition-transform" 
                              : "bg-muted"
                          )}>
                            {feature.included && FeatureIcon ? (
                              <FeatureIcon className="w-5 h-5 text-white" />
                            ) : feature.included ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm",
                            feature.included 
                              ? "text-foreground font-semibold group-hover:text-primary transition-colors" 
                              : "text-muted-foreground"
                          )}>
                            {feature.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <span className="text-base text-left mb-2 font-medium">
                      Recursos:
                    </span>
                    {plan.features?.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={index} className="flex items-center justify-start gap-3">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
                            feature.included ? "bg-secondary/10" : "bg-muted"
                          )}>
                            {feature.included && FeatureIcon ? (
                              <FeatureIcon className="w-4 h-4 text-secondary" />
                            ) : !feature.included && FeatureIcon ? (
                              <FeatureIcon className="w-4 h-4 text-muted-foreground opacity-40" />
                            ) : feature.included ? (
                              <Check className="w-4 h-4 text-secondary" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm",
                            feature.included ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {feature.name}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
