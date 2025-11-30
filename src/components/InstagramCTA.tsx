import { Instagram, Camera, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstagramCTA = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-8 shadow-lg">
              <Instagram className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Conecte-se com a Meio Limão
            </h2>
            
            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Acompanhe nosso dia a dia, inspire-se com looks reais e faça parte da nossa comunidade tropical chic
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-10">
              <Heart className="h-4 w-4 text-destructive fill-destructive" />
              <span>Mais de 10k seguidoras apaixonadas</span>
            </div>

            <a
              href="https://instagram.com/meiolimao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="group bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all">
                <Instagram className="mr-2 h-5 w-5" />
                Seguir @meiolimao
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Camera className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Looks Reais</h3>
              <p className="text-sm text-muted-foreground">
                Veja como nossas clientes usam as peças no dia a dia
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Instagram className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Lançamentos</h3>
              <p className="text-sm text-muted-foreground">
                Seja a primeira a saber de novidades e coleções exclusivas
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Comunidade</h3>
              <p className="text-sm text-muted-foreground">
                Faça parte de uma comunidade que valoriza estilo e autenticidade
              </p>
            </div>
          </div>

          {/* Hashtag */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-3">Use a hashtag e apareça em nosso feed</p>
            <p className="font-serif text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              #MeioLimaoStyle
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramCTA;
