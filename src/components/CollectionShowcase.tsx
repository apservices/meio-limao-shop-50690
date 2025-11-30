import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  tag?: string;
  link: string;
}

const CollectionShowcase = () => {
  const collections: Collection[] = [
    {
      id: "1",
      title: "Coleção Cítrica",
      description: "Peças leves para dias solares. Vista o frescor, sinta a energia.",
      image: "/placeholder.svg?height=800&width=600",
      tag: "Nova Coleção",
      link: "/shop"
    },
    {
      id: "2",
      title: "Tropical Chic",
      description: "Elegância natural que celebra a brasilidade com sofisticação.",
      image: "/placeholder.svg?height=800&width=600",
      tag: "Editorial",
      link: "/looks"
    },
    {
      id: "3",
      title: "Essenciais",
      description: "Peças atemporais que compõem o guarda-roupa perfeito.",
      image: "/placeholder.svg?height=800&width=600",
      link: "/shop"
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-primary font-medium uppercase tracking-wider text-sm">
              Explore Nossas Coleções
            </p>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Descubra Seu Estilo
          </h2>
          <p className="text-lg text-muted-foreground">
            Cada coleção é uma jornada de estilo, leveza e autenticidade
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <Link 
              key={collection.id}
              to={collection.link}
              className="group relative overflow-hidden rounded-3xl bg-card hover:shadow-2xl transition-all duration-500"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Tag */}
                {collection.tag && (
                  <div className="absolute top-6 left-6">
                    <span className="inline-block px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {collection.tag}
                    </span>
                  </div>
                )}
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-serif text-3xl font-bold text-white mb-3">
                    {collection.title}
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    {collection.description}
                  </p>
                  <Button 
                    variant="secondary" 
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Explorar
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Não encontrou o que procurava?
          </p>
          <Link to="/shop">
            <Button size="lg" variant="outline" className="group">
              Ver Todas as Peças
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionShowcase;
