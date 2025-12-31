import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ColorImage } from "@/types/colorImage";

// Cache global fora do React para persistir entre re-renders
const globalCache = new Map<string, ColorImage[]>();
const pendingRequests = new Map<string, Promise<ColorImage[]>>();

export const useColorImagesCache = () => {
  const [loading, setLoading] = useState(false);

  const getColorImages = useCallback(async (productId: string): Promise<ColorImage[]> => {
    // Verificar cache primeiro
    if (globalCache.has(productId)) {
      return globalCache.get(productId)!;
    }

    // Se já existe uma requisição pendente para este produto, aguardar ela
    if (pendingRequests.has(productId)) {
      return pendingRequests.get(productId)!;
    }

    // Criar nova requisição
    setLoading(true);
    
    const request = (async () => {
      try {
        const { data, error } = await supabase
          .from("product_color_images")
          .select("*")
          .eq("product_id", productId)
          .order("sort_order");

        if (error) {
          console.warn("Erro ao buscar imagens por cor:", error);
          return [];
        }

        const images: ColorImage[] = (data ?? []).map(img => ({
          id: img.id,
          product_id: img.product_id,
          color_name: img.color_name,
          image_url: img.image_url,
          is_primary: img.is_primary ?? false,
          sort_order: img.sort_order ?? 0,
        }));

        // Armazenar no cache
        globalCache.set(productId, images);
        
        return images;
      } finally {
        pendingRequests.delete(productId);
        setLoading(false);
      }
    })();

    pendingRequests.set(productId, request);
    return request;
  }, []);

  const prefetchColorImages = useCallback(async (productIds: string[]) => {
    // Filtrar apenas os que não estão no cache
    const uncachedIds = productIds.filter(id => !globalCache.has(id));
    
    if (uncachedIds.length === 0) return;

    // Buscar todos de uma vez
    const { data, error } = await supabase
      .from("product_color_images")
      .select("*")
      .in("product_id", uncachedIds)
      .order("sort_order");

    if (error) {
      console.warn("Erro ao prefetch imagens por cor:", error);
      return;
    }

    // Agrupar por product_id e cachear
    const grouped = new Map<string, ColorImage[]>();
    
    (data ?? []).forEach(img => {
      const productId = img.product_id;
      if (!grouped.has(productId)) {
        grouped.set(productId, []);
      }
      grouped.get(productId)!.push({
        id: img.id,
        product_id: img.product_id,
        color_name: img.color_name,
        image_url: img.image_url,
        is_primary: img.is_primary ?? false,
        sort_order: img.sort_order ?? 0,
      });
    });

    // Cachear cada produto (inclusive os sem imagens)
    uncachedIds.forEach(id => {
      globalCache.set(id, grouped.get(id) || []);
    });
  }, []);

  const getCached = useCallback((productId: string): ColorImage[] | undefined => {
    return globalCache.get(productId);
  }, []);

  const clearCache = useCallback(() => {
    globalCache.clear();
  }, []);

  return {
    getColorImages,
    prefetchColorImages,
    getCached,
    clearCache,
    loading,
  };
};

// Exportar função para limpar cache (útil para invalidação)
export const clearColorImagesCache = () => {
  globalCache.clear();
};
