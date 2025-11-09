import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { Heart, Leaf, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Sobre a Meio Limão - Moda Feminina Brasileira</title>
        <meta
          name="description"
          content="Conheça a história da Meio Limão, marca de moda feminina que une estilo tropical chic com elegância natural e sustentabilidade."
        />
      </Helmet>

      <Navbar />

      <main className="pb-20 md:pb-8">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <div className="text-center max-w-3xl">
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
                Sobre a Meio Limão
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Estilo tropical chic com elegância natural
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-center">
                Nossa História
              </h2>
              <div className="space-y-6 text-foreground/80 leading-relaxed">
                <p>
                  A Meio Limão nasceu do sonho de criar uma moda que celebra a
                  brasilidade com sofisticação. Inspirada nas cores vibrantes e na
                  leveza do nosso clima tropical, cada peça é pensada para a mulher
                  moderna que busca conforto sem abrir mão do estilo.
                </p>
                <p>
                  Nossa essência está no equilíbrio perfeito entre o natural e o
                  elegante, onde tecidos leves encontram modelagens impecáveis, e
                  cores suaves conversam com estampas autorais.
                </p>
                <p>
                  Acreditamos que a moda deve ser uma extensão da sua personalidade,
                  por isso trabalhamos com coleções versáteis que transitam do dia
                  para a noite com facilidade e charme.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12 text-center">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-semibold">Autenticidade</h3>
                <p className="text-muted-foreground">
                  Peças únicas que celebram a essência feminina brasileira com
                  design autoral e exclusivo.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  <Leaf className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-semibold">Sustentabilidade</h3>
                <p className="text-muted-foreground">
                  Comprometimento com tecidos naturais e processos conscientes que
                  respeitam o meio ambiente.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-semibold">Qualidade</h3>
                <p className="text-muted-foreground">
                  Cada detalhe é pensado com cuidado, desde a escolha dos materiais
                  até o acabamento final.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                Nossa Missão
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Criar uma moda atemporal que valoriza a mulher brasileira,
                combinando conforto, elegância e consciência. Queremos que cada
                cliente se sinta única, confiante e conectada com sua essência ao
                vestir Meio Limão.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default About;
