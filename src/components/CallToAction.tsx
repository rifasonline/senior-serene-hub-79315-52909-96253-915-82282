import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
const CallToAction = () => {
  return <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-12 md:p-16 lg:p-20 shadow-elegant hover-glow animate-scale-in">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-float" style={{
          animationDelay: '1.5s'
        }}></div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-white">
              Pronto para cuidar melhor dos seus idosos?
            </h2>
            <p className="text-lg md:text-xl text-white/90">
              Baixe agora o CuidaBem e experimente todas as funcionalidades do Plano Pro por 7 dias grátis. 
              Sem compromisso, cancele quando quiser.
            </p>
            
            <div className="flex justify-center">
              <Button variant="outline" size="lg" onClick={() => {
              const pricingSection = document.getElementById('pricing');
              if (pricingSection) {
                pricingSection.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }} className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 hover:border-white shadow-card group backdrop-blur-sm text-lg font-normal rounded-3xl">
                Assinar Plano Pro - R$49,90
                <ArrowRight className="ml-2 h-5 w-5 transition-smooth group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default CallToAction;