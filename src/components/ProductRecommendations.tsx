import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Skeleton } from "./ui/skeleton";
import { Sparkles } from "lucide-react";
import { toProduct } from "@/types/product";

interface ProductRecommendationsProps {
  userId?: string;
  currentProductId?: string;
  limit?: number;
}

export const ProductRecommendations = ({ 
  userId, 
  currentProductId,
  limit = 8 
}: ProductRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId, currentProductId]);

  const loadRecommendations = async () => {
    if (!userId) {
      // Se não tem usuário, mostrar produtos populares
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);
      
      setRecommendations((data || []).map(toProduct));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        'get-product-recommendations',
        {
          body: {
            userId,
            productId: currentProductId,
            limit
          }
        }
      );

      if (error) throw error;

      setRecommendations((data?.recommendations || []).map(toProduct));
      setInsights(data?.insights);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      // Fallback para produtos populares
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);
      
      setRecommendations((data || []).map(toProduct));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Recomendado para você
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {userId ? 'Recomendado para você' : 'Produtos em destaque'}
        </h2>
        {insights && insights.totalPurchases > 0 && (
          <p className="text-sm text-muted-foreground">
            Baseado em {insights.totalPurchases} compra{insights.totalPurchases > 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {insights && insights.topCategories?.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Seus estilos favoritos: {insights.topCategories.join(', ')}
        </p>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
