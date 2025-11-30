import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[450px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-3xl mx-4 my-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Nova Coleção Meio Limão"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-xl space-y-4 md:space-y-6">
          <div className="space-y-2">
            <p className="text-secondary text-xs md:text-sm lg:text-base font-medium uppercase tracking-wider">
              Nova Coleção
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-tight">
              Coleção<br />
              Cítrica
            </h1>
          </div>
          
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-md">
            Peças leves para dias solares. Vista o frescor, sinta a energia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop">
              <Button variant="hero" size="lg">
                Ver Coleção
              </Button>
            </Link>
            <Link to="/novidades">
              <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-foreground">
                Novidades
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
