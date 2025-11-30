import { Link } from "react-router-dom";
import { useMemo } from "react";
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
import SecurityBadges from "@/components/SecurityBadges";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { toProduct } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { data } = useProductsQuery();
  const { user } = useAuth();
  
  const newArrivals = useMemo(() => {
    if (!data?.products) return [];
    return data.products
      .filter(p => p.is_new)
      .slice(0, 8)
      .map(toProduct);
  }, [data?.products]);

  const bestSellers = useMemo(() => {
    if (!data?.products) return [];
    return data.products
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8)
      .map(toProduct);
  }, [data?.products]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pb-20 md:pb-8">
        {/* Hero */}
        <HeroSection />

        {/* Benefits */}
        <BenefitsSection />

        {/* Security Badges */}
        <SecurityBadges />

        {/* Personalized Recommendations - Only show if user is logged in */}
        {user && (
          <section className="py-16 container mx-auto px-4">
            <ProductRecommendations 
              userId={user.id} 
              limit={8}
            />
          </section>
        )}

        {/* New Arrivals */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">Novidades</h2>
              <p className="text-muted-foreground">Acabaram de chegar</p>
            </div>
            <Link to="/novidades">
              <Button variant="outline" className="group">
                Ver Tudo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto novo disponível no momento
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-gradient-to-br from-secondary via-primary/20 to-accent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Feito para quem floresce vivendo
            </h2>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md mb-8 max-w-2xl mx-auto">
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
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">Mais Vendidos</h2>
              <p className="text-muted-foreground">Queridinhos das clientes</p>
            </div>
          </div>
          
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto disponível no momento
            </div>
          )}
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
