import careTogetherImage from "@/assets/care-together.jpg";
import { useCountUp } from "@/hooks/useCountUp";

const CareTogether = () => {
  const { count: users, ref: usersRef } = useCountUp({ end: 1000, duration: 2500 });
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-foreground mb-8 sm:mb-12">
            Cuidar com amor, viver com dignidade
          </h2>
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30">
            <img
              src={careTogetherImage}
              alt="Idoso e cuidador juntos, olhando confiantes para o futuro"
              className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 pointer-events-none"></div>
          </div>
          
          <div ref={usersRef} className="mt-8 text-center animate-fade-in">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-4xl sm:text-5xl font-bold text-primary">
                +{users}
              </span>
              <span className="text-lg sm:text-xl text-muted-foreground">
                usuários usam os nossos serviços
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareTogether;
