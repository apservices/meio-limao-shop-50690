import { Leaf, Sun, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BrandStory = () => {
  const values = [
    {
      icon: Leaf,
      title: "Sustentabilidade",
      description: "Moda consciente que respeita a natureza"
    },
    {
      icon: Sun,
      title: "Brasilidade",
      description: "Cores e leveza do nosso clima tropical"
    },
    {
      icon: Sparkles,
      title: "Qualidade Premium",
      description: "Tecidos nobres e acabamento impecável"
    },
    {
      icon: Heart,
      title: "Feito com Amor",
      description: "Cada peça conta uma história única"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="container mx-auto px-4">
        {/* Main Story */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary/80 font-light uppercase tracking-wider mb-3 text-xs">
            Nossa Essência
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-6 text-foreground/90">
            A Mulher Meio Limão
          </h2>
          <div className="space-y-4 text-sm md:text-base text-muted-foreground/90 leading-relaxed">
            <p className="font-light">
              <span className="font-serif text-lg md:text-xl text-foreground/80 italic">Ela floresce vivendo.</span> Abraça o sol, dança com a brisa, celebra cada momento com leveza e autenticidade.
            </p>
            <p className="font-light">
              A mulher Meio Limão carrega o frescor dos trópicos em seu estilo — peças leves que acompanham sua jornada com elegância natural, tecidos que respiram, cores que vibram.
            </p>
            <p className="text-foreground/70 font-light">
              Mais que roupas, criamos uma experiência de liberdade, conforto e sofisticação tropical.
            </p>
          </div>
          <div className="mt-8">
            <Link to="/about">
              <Button size="default" variant="ghost" className="group text-muted-foreground hover:text-primary">
                Conheça Nossa História
                <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div 
                key={index}
                className="text-center p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
