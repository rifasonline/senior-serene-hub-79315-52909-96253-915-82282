import careTogetherImage from "@/assets/care-together.jpg";

const CareTogether = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30">
            <img
              src={careTogetherImage}
              alt="Idoso e cuidador juntos, olhando confiantes para o futuro"
              className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareTogether;
