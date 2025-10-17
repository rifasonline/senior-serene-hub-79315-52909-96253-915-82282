import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CareTogether from "@/components/CareTogether";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <CareTogether />
      <Pricing />
      <Testimonials />
      <CallToAction />
    </div>
  );
};

export default Home;
