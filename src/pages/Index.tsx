import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import NewsletterPopup from "@/components/NewsletterPopup";
import TestimonialsSection from "@/components/TestimonialsSection";
import LooksSection from "@/components/LooksSection";
import InstagramFeed from "@/components/InstagramFeed";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { mapMockProductToStoreProduct, mockProducts } from "@/data/products";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const newArrivals = mockProducts.filter(p => p.isNew).slice(0, 4).map(mapMockProductToStoreProduct);
  const bestSellers = mockProducts.slice(0, 4).map(mapMockProductToStoreProduct);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pb-20 md:pb-8">
        {/* Hero */}
        <HeroSection />

        {/* Benefits */}
        <BenefitsSection />

        {/* New Arrivals */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Novidades</h2>
              <p className="text-muted-foreground">Acabaram de chegar</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="group">
                Ver Tudo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-gradient-to-br from-secondary via-primary/20 to-accent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Feito para quem floresce vivendo
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Peças que celebram sua autenticidade e leveza
            </p>
            <Link to="/shop">
              <Button variant="hero" size="lg">
                Descubra a Coleção
              </Button>
            </Link>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Mais Vendidos</h2>
              <p className="text-muted-foreground">Queridinhos das clientes</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>

        <LooksSection />
        <TestimonialsSection />
        <InstagramFeed />
        <Newsletter />
      </main>

      <Footer />
      <NewsletterPopup />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
