import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useCountUp } from "@/hooks/useCountUp";

const Hero = () => {
  const { count: usersCount, ref: usersRef } = useCountUp({
    end: 10,
    duration: 2000,
    decimals: 0,
  });

  const { count: ratingCount, ref: ratingRef } = useCountUp({
    end: 4.9,
    duration: 2000,
    decimals: 1,
  });

  const { count: satisfactionCount, ref: satisfactionRef } = useCountUp({
    end: 98,
    duration: 2000,
    decimals: 0,
  });

  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-foreground leading-tight">
                Cuidado com idosos simplificado e inteligente
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Um aplicativo completo para cuidadores que facilita a rotina de cuidados, 
                promovendo bem-estar e saúde através de funcionalidades inteligentes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                variant="hero" 
                size="lg" 
                className="group"
                onClick={() => {
                  const pricingSection = document.getElementById('pricing');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Ver Planos
                <ArrowRight className="ml-2 h-5 w-5 transition-smooth group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Stats */}
            <div className="pt-8 grid grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="space-y-1" ref={usersRef}>
                <p className="text-3xl font-bold text-primary">
                  {usersCount}k+
                </p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
              <div className="space-y-1" ref={ratingRef}>
                <p className="text-3xl font-bold text-secondary">
                  {ratingCount}
                </p>
                <p className="text-sm text-muted-foreground">Avaliação</p>
              </div>
              <div className="space-y-1" ref={satisfactionRef}>
                <p className="text-3xl font-bold text-accent">
                  {satisfactionCount}%
                </p>
                <p className="text-sm text-muted-foreground">Satisfação</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative lg:pl-8 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-2xl overflow-hidden shadow-elegant border-2 border-primary/30 hover:border-primary/50 transition-smooth hover-glow">
              <img
                src={heroImage}
                alt="Cuidador ajudando idoso com aplicativo CuidaBem"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 gradient-primary opacity-20 blur-3xl rounded-full -z-10 animate-float"></div>
            <div className="absolute -bottom-8 -left-8 w-72 h-72 gradient-secondary opacity-20 blur-3xl rounded-full -z-10 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
