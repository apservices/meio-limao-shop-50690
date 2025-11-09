import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstagramFeed = () => {
  // Mock data - substituir por integração real com Instagram API
  const posts = [
    { id: 1, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop" },
    { id: 2, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop" },
    { id: 3, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop" },
    { id: 4, image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop" },
    { id: 5, image: "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=400&h=400&fit=crop" },
    { id: 6, image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&h=400&fit=crop" },
  ];

  return (
    <section className="py-16 bg-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            @meiolimao
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Inspire-se com nossos looks e compartilhe seu estilo marcando a gente
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="https://instagram.com/meiolimao" target="_blank" rel="noopener noreferrer">
              <Instagram className="mr-2 h-5 w-5" />
              Seguir no Instagram
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/meiolimao"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square overflow-hidden rounded-lg group relative"
            >
              <img
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="h-8 w-8 text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
