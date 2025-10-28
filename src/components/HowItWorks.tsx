import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, CreditCard, Sparkles } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Crie a sua conta",
      description: "Faça seu cadastro de forma simples e rápida para começar a usar o aplicativo.",
    },
    {
      number: "2",
      icon: CreditCard,
      title: "Escolha seu plano",
      description: "Selecione entre o Plano Básico ou o Plano Pro, conforme o tipo de suporte que deseja receber. É fácil, rápido e sem complicação.",
    },
    {
      number: "3",
      icon: Sparkles,
      title: "Use o aplicativo à vontade",
      description: "Comece a usar todos os recursos e converse com o assistente sempre que precisar. Receba ajuda, orientação e suporte de forma simples e personalizada.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-subtle relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Como Funciona?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece em apenas 3 passos simples
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative max-w-6xl mx-auto">
          {/* Connecting Line (hidden on mobile) */}
          <div className="absolute top-24 left-0 right-0 hidden md:block px-24">
            <div className="border-t-2 border-dashed border-muted/40" />
          </div>

          {/* Step Cards */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="relative bg-card shadow-card hover:shadow-elegant transition-smooth hover-lift h-full border-2">
                  <CardContent className="p-8 lg:p-10 flex flex-col items-center text-center">
                    {/* Number Badge */}
                    <div className="relative z-10 mb-6">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                        <span className="text-4xl lg:text-5xl font-bold text-white">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="mb-6 p-4 rounded-full bg-primary/10">
                      <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl lg:text-2xl font-bold mb-4 tracking-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Decorative Element */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center mt-12 lg:mt-16"
        >
          <p className="text-muted-foreground text-base lg:text-lg font-medium">
            Pronto para começar? É rápido e fácil! 🎉
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
