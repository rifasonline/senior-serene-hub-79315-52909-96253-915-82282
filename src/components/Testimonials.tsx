import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import anaCostaImage from "@/assets/ana-costa.png";
import robertoLimaImage from "@/assets/roberto-lima.png";
import carlosOliveiraImage from "@/assets/carlos-oliveira.png";
import joaoSantosImage from "@/assets/joao-santos.png";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Cuidadora Profissional",
      avatar: "MS",
      text: "O CuidaBem transformou minha rotina! Agora consigo organizar todos os medicamentos e compromissos dos meus pacientes em um só lugar. Indispensável!",
      rating: 5,
    },
    {
      name: "João Santos",
      role: "Filho de Idoso",
      avatar: "JS",
      image: joaoSantosImage,
      text: "Mesmo morando longe, consigo acompanhar os cuidados com meu pai. Os alertas me dão tranquilidade e segurança. Melhor investimento que fiz!",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Enfermeira",
      avatar: "AC",
      image: anaCostaImage,
      text: "A interface é super intuitiva e as funcionalidades são completas. Os relatórios em PDF facilitam muito a comunicação com os médicos.",
      rating: 5,
    },
    {
      name: "Carlos Oliveira",
      role: "Familiar Cuidador",
      avatar: "CO",
      image: carlosOliveiraImage,
      text: "As sugestões de atividades mantêm minha mãe ativa e engajada. O suporte 24/7 é excelente. Recomendo de olhos fechados!",
      rating: 5,
    },
    {
      name: "Paula Mendes",
      role: "Cuidadora",
      avatar: "PM",
      text: "Nunca imaginei que cuidar pudesse ser tão organizado. O app me poupa tempo e evita esquecimentos importantes.",
      rating: 5,
    },
    {
      name: "Roberto Lima",
      role: "Médico Geriatra",
      avatar: "RL",
      image: robertoLimaImage,
      text: "Recomendo o CuidaBem para todos os meus pacientes. A qualidade do acompanhamento melhorou significativamente.",
      rating: 5,
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "start",
      skipSnaps: false,
      duration: 30,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  useEffect(() => {
    if (!emblaApi) return;
  }, [emblaApi]);

  return (
    <section className="py-20 md:py-28 bg-gradient-subtle overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-foreground mb-4">
            Confiança de quem cuida
          </h2>
          <p className="text-lg text-muted-foreground">
            Veja o que nossos usuários dizem sobre o CuidaBem
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6 transition-transform duration-500 ease-out">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 h-full border-border bg-card/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover shadow-soft border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-soft">
                        {testimonial.avatar}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
