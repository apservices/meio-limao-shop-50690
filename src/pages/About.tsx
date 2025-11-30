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
        {/* Hero Section with Elegant Background */}
        <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/40 to-accent/30" />
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Dark overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80" />
          
          {/* Content */}
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <div className="text-center max-w-4xl animate-fade-in">
              <div className="mb-6">
                <img 
                  src="/icon-192.png" 
                  alt="Meio Limão" 
                  className="h-24 w-24 mx-auto mb-4 animate-scale-in drop-shadow-2xl"
                />
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-foreground drop-shadow-lg">
                Meio Limão
              </h1>
              <p className="text-xl md:text-2xl text-foreground mb-4 font-light drop-shadow-md">
                Mais que moda, um estilo de vida
              </p>
              <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto drop-shadow-sm">
                Estilo tropical chic com elegância natural que celebra a essência feminina brasileira
              </p>
              
              {/* Decorative elements */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-foreground/30" />
                <Sparkles className="h-5 w-5 text-foreground/70" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-foreground/30" />
              </div>
            </div>
          </div>
          
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Story Section with elegant design */}
        <section className="py-20 md:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Nossa Essência
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                  A História por Trás da Marca
                </h2>
              </div>
              
              <div className="space-y-8 text-lg leading-relaxed">
                <div className="p-8 rounded-2xl bg-card border border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
                  <p className="text-foreground">
                    A <strong className="text-primary font-bold">Meio Limão</strong> nasceu do sonho de criar uma moda que celebra a
                    brasilidade com sofisticação. Inspirada nas cores vibrantes e na
                    leveza do nosso clima tropical, cada peça é pensada para a mulher
                    moderna que busca conforto sem abrir mão do estilo.
                  </p>
                </div>
                
                <div className="p-8 rounded-2xl bg-card border border-secondary/30 shadow-lg hover:shadow-xl transition-shadow">
                  <p className="text-foreground">
                    Nossa essência está no <strong className="text-secondary font-bold">equilíbrio perfeito</strong> entre o natural e o
                    elegante, onde tecidos leves encontram modelagens impecáveis, e
                    cores suaves conversam com estampas autorais.
                  </p>
                </div>
                
                <div className="p-8 rounded-2xl bg-card border border-accent/30 shadow-lg hover:shadow-xl transition-shadow">
                  <p className="text-foreground">
                    Acreditamos que a moda deve ser uma <strong className="text-accent font-bold">extensão da sua personalidade</strong>,
                    por isso trabalhamos com coleções versáteis que transitam do dia
                    para a noite com facilidade e charme.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section with premium design */}
        <section className="py-20 relative overflow-hidden">
          {/* Premium background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5" />
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--secondary)) 0%, transparent 50%)`,
            }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                O Que Nos Move
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Nossos Valores
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Pilares que guiam cada decisão e cada criação da Meio Limão
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="group text-center space-y-6 p-8 rounded-2xl bg-card border border-primary/40 hover:border-primary/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                  <Heart className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-3">Autenticidade</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Peças únicas que celebram a essência feminina brasileira com
                    design autoral e exclusivo que reflete sua personalidade.
                  </p>
                </div>
              </div>
              
              <div className="group text-center space-y-6 p-8 rounded-2xl bg-card border border-secondary/40 hover:border-secondary/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 text-secondary group-hover:scale-110 transition-transform">
                  <Leaf className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-3">Sustentabilidade</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Comprometimento com tecidos naturais e processos conscientes que
                    respeitam o meio ambiente e as futuras gerações.
                  </p>
                </div>
              </div>
              
              <div className="group text-center space-y-6 p-8 rounded-2xl bg-card border border-accent/40 hover:border-accent/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 text-accent group-hover:scale-110 transition-transform">
                  <Sparkles className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-3">Qualidade</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Cada detalhe é pensado com cuidado, desde a escolha dos materiais
                    até o acabamento final, garantindo excelência em cada peça.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section with impact */}
        <section className="py-20 md:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center p-12 md:p-16 rounded-3xl bg-card border border-primary/40 shadow-2xl">
                <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
                  Nosso Propósito
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">
                  Nossa Missão
                </h2>
                <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                  Criar uma moda <strong className="text-primary font-bold">atemporal</strong> que valoriza a mulher brasileira,
                  combinando <strong className="text-secondary font-bold">conforto</strong>, <strong className="text-accent font-bold">elegância</strong> e consciência.
                </p>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  Queremos que cada cliente se sinta única, confiante e conectada com sua essência ao
                  vestir Meio Limão. Cada peça conta uma história, celebra uma personalidade.
                </p>
              </div>
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
