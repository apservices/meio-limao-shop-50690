import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id?: string;
  is_new?: boolean;
  rating?: number;
  reviews_count?: number;
  original_price?: number;
}

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNewProducts();
  }, []);

  const loadNewProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get products created or updated in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .or(`created_at.gte.${thirtyDaysAgo.toISOString()},updated_at.gte.${thirtyDaysAgo.toISOString()}`)
        .order("created_at", { ascending: false })
        .limit(24);

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error("Error loading new products:", err);
      setError("Erro ao carregar novidades. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Novidades - Meio Limão | Últimos Lançamentos em Moda Feminina</title>
        <meta
          name="description"
          content="Confira os últimos lançamentos da Meio Limão. Peças exclusivas de moda feminina tropical chic recém-chegadas."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Novidades</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubra os últimos lançamentos da Meio Limão. Peças exclusivas que acabaram de chegar para renovar seu guarda-roupa.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Nenhuma novidade disponível no momento. Volte em breve para conferir nossos lançamentos!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  image={product.image_url}
                  category={product.category_id || "Moda"}
                  isNew={product.is_new}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
        <WhatsAppButton />
        <MobileBottomNav />
      </div>
    </>
  );
};

export default NewArrivals;
