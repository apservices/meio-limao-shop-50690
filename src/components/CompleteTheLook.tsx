import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Sparkles } from "lucide-react";
import type { Product } from "@/types/product";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { toProduct } from "@/types/product";

interface CompleteTheLookProps {
  currentProductId: string;
  category?: string | null;
}

const CompleteTheLook = ({ currentProductId, category }: CompleteTheLookProps) => {
  const { data } = useProductsQuery();
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    if (data?.products) {
      // Filter products from same category, exclude current product
      const related = data.products
        .filter(p => p.id !== currentProductId && p.is_active)
        .filter(p => !category || p.category_id === category)
        .slice(0, 4)
        .map(toProduct);
      
      setSuggestions(related);
    }
  }, [data?.products, currentProductId, category]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <p className="text-primary font-medium uppercase tracking-wider text-sm">
              Complete o Look
            </p>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Combine com estas peças
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecionamos especialmente para você peças que harmonizam perfeitamente com este produto
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {suggestions.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompleteTheLook;
