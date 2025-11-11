import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Look {
  id: string;
  title: string;
  description: string;
  image_url: string;
  product_ids: string[];
  sort_order: number;
}

const Looks = () => {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLooks();
  }, []);

  const loadLooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("looks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLooks(data || []);
    } catch (err) {
      console.error("Error loading looks:", err);
      setError("Erro ao carregar looks. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProducts = (productIds: string[]) => {
    if (productIds.length > 0) {
      // Navigate to shop with filter for these products
      navigate(`/shop?products=${productIds.join(",")}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Looks - Meio Limão | Inspiração de Estilo Tropical Chic</title>
        <meta
          name="description"
          content="Descubra combinações perfeitas e inspire-se com os looks exclusivos da Meio Limão. Moda feminina tropical chic para todas as ocasiões."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Nossos Looks</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Inspire-se com combinações exclusivas criadas especialmente para você. Descubra o estilo tropical chic da Meio Limão.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-96 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : looks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Novos looks em breve! Estamos preparando combinações incríveis para você.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {looks.map((look) => (
                <div
                  key={look.id}
                  className="group bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden aspect-[3/4]">
                    <img
                      src={look.image_url}
                      alt={look.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">{look.title}</h3>
                    {look.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {look.description}
                      </p>
                    )}
                    <Button
                      onClick={() => handleViewProducts(look.product_ids)}
                      className="w-full"
                      disabled={!look.product_ids || look.product_ids.length === 0}
                    >
                      Ver Peças
                    </Button>
                  </div>
                </div>
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

export default Looks;
