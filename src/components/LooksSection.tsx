import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const LooksSection = () => {
  const looks = [
    {
      id: 1,
      title: "Verão na Cidade",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
      products: ["Vestido Longo Solar", "Sandália Rasteira"],
    },
    {
      id: 2,
      title: "Brunch das Amigas",
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop",
      products: ["Top Ciganinha", "Calça Linho Natural"],
    },
    {
      id: 3,
      title: "Praia Tropical",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop",
      products: ["Camisa Tropical Paradise", "Short Linho"],
    },
  ];

  return (
    <section className="py-16 bg-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Looks da Semana
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Combinações criadas por nosso time de estilo para você se inspirar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {looks.map((look) => (
            <div key={look.id} className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[3/4]">
                <img
                  src={look.image}
                  alt={look.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-serif font-semibold mb-2">{look.title}</h3>
                <ul className="text-sm space-y-1 mb-4">
                  {look.products.map((product, index) => (
                    <li key={index}>• {product}</li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <Link to="/shop">
                    Ver peças
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LooksSection;
