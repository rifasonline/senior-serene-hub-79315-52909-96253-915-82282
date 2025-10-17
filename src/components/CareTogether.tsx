import careTogetherImage from "@/assets/care-together.jpg";

const CareTogether = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-elegant">
            <img
              src={careTogetherImage}
              alt="Idoso e cuidador juntos, olhando confiantes para o futuro"
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/98 via-background/70 to-transparent flex items-end">
              <div className="p-6 sm:p-8 md:p-12 w-full text-center animate-fade-in-up">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 leading-tight">
                  Cuidar com amor, viver com dignidade
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-primary/80 max-w-3xl mx-auto px-4">
                  Juntos, construímos um futuro onde cada momento importa e cada cuidado fortalece laços
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareTogether;
