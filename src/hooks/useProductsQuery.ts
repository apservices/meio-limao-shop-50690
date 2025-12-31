import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type {
  CategoryRow,
  NormalizedReview,
  ProductWithRelations,
  ReviewWithCustomer,
} from "@/types/product";
import { getPrimaryImageUrl } from "@/types/product";
import { getMockProductsAsProductRecords } from "@/data/products";
import type { ColorImage } from "@/types/colorImage";

interface ProductsQueryResult {
  products: ProductWithRelations[];
  categories: CategoryRow[];
  isFallback: boolean;
}

interface ProductQueryResult {
  product: ProductWithRelations;
  reviews: NormalizedReview[];
  related: ProductWithRelations[];
  colorImages: ColorImage[];
  isFallback: boolean;
}

const buildFallbackCategories = (products: ProductWithRelations[]): CategoryRow[] => {
  const map = new Map<string, CategoryRow>();
  products.forEach((product) => {
    if (product.categories) {
      map.set(product.categories.id, product.categories);
    }
  });
  return Array.from(map.values());
};

const normalizeReviews = (reviews: ReviewWithCustomer[]): NormalizedReview[] =>
  reviews.map((review) => ({
    id: review.id,
    author: review.customers?.name ?? "Cliente Meio Limão",
    avatar: undefined,
    rating: review.rating,
    date: review.created_at
      ? new Date(review.created_at).toLocaleDateString("pt-BR")
      : "",
    comment: review.body ?? review.title ?? "",
    images: [],
    verified: true,
  }));

const buildMockReviews = (product: ProductWithRelations): NormalizedReview[] => [
  {
    id: `${product.id}-review-1`,
    author: "Julia Santos",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    date: "15/01/2025",
    comment:
      "Amei! O tecido é super leve e o caimento ficou perfeito. A cor é ainda mais linda ao vivo!",
    images: getPrimaryImageUrl(product) ? [getPrimaryImageUrl(product)!] : [],
    verified: true,
  },
  {
    id: `${product.id}-review-2`,
    author: "Mariana Costa",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    date: "10/01/2025",
    comment:
      "Qualidade impecável! Super confortável e versátil. Já comprei outras peças da marca.",
    images: [],
    verified: true,
  },
  {
    id: `${product.id}-review-3`,
    author: "Beatriz Oliveira",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 4,
    date: "05/01/2025",
    comment:
      "Produto muito bom, porém achei o tamanho um pouco maior. Recomendo conferir a tabela de medidas.",
    images: [],
    verified: true,
  },
];

const fetchProducts = async (): Promise<ProductsQueryResult> => {
  if (!isSupabaseConfigured) {
    const fallbackProducts = getMockProductsAsProductRecords();
    return {
      products: fallbackProducts,
      categories: buildFallbackCategories(fallbackProducts),
      isFallback: true,
    };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories:categories(*),
        product_variants(*)
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (categoriesError) throw categoriesError;

    return {
      products: (data ?? []) as ProductWithRelations[],
      categories: categoriesData ?? [],
      isFallback: false,
    };
  } catch (err) {
    console.warn("[useProductsQuery] Falling back to mock data", err);
    const fallbackProducts = getMockProductsAsProductRecords();
    return {
      products: fallbackProducts,
      categories: buildFallbackCategories(fallbackProducts),
      isFallback: true,
    };
  }
};

const fetchProduct = async (productId: string): Promise<ProductQueryResult> => {
  if (!isSupabaseConfigured) {
    const fallbackProduct = getMockProductsAsProductRecords().find(
      (product) => product.id === productId
    );

    if (!fallbackProduct) {
      throw new Error("Produto não encontrado");
    }

    const related = getMockProductsAsProductRecords()
      .filter(
        (product) =>
          product.category_id === fallbackProduct.category_id && product.id !== fallbackProduct.id
      )
      .slice(0, 4);

    return {
      product: fallbackProduct,
      reviews: buildMockReviews(fallbackProduct),
      related,
      colorImages: [],
      isFallback: true,
    };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories:categories(*),
        product_variants(*)
      `
      )
      .eq("id", productId)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Produto não encontrado");
    }

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        *,
        customers(*)
      `
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (reviewsError) throw reviewsError;

    // Buscar imagens por cor
    const { data: colorImagesData, error: colorImagesError } = await supabase
      .from("product_color_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");

    if (colorImagesError) {
      console.warn("Erro ao buscar imagens por cor:", colorImagesError);
    }

    let relatedQuery = supabase
      .from("products")
      .select(
        `
        *,
        categories:categories(*),
        product_variants(*)
      `
      )
      .neq("id", productId)
      .eq("is_active", true)
      .limit(4);

    if (data.category_id) {
      relatedQuery = relatedQuery.eq("category_id", data.category_id);
    }

    const { data: relatedData, error: relatedError } = await relatedQuery;

    if (relatedError) throw relatedError;

    return {
      product: data as ProductWithRelations,
      reviews: normalizeReviews((reviewsData as ReviewWithCustomer[]) ?? []),
      related: (relatedData ?? []) as ProductWithRelations[],
      colorImages: (colorImagesData ?? []).map(img => ({
        id: img.id,
        product_id: img.product_id,
        color_name: img.color_name,
        image_url: img.image_url,
        is_primary: img.is_primary ?? false,
        sort_order: img.sort_order ?? 0,
      })),
      isFallback: false,
    };
  } catch (err) {
    console.warn("[useProductQuery] Falling back to mock product", err);
    const fallbackProduct = getMockProductsAsProductRecords().find(
      (product) => product.id === productId
    );

    if (!fallbackProduct) {
      throw err ?? new Error("Produto não encontrado");
    }

    const related = getMockProductsAsProductRecords()
      .filter(
        (product) =>
          product.category_id === fallbackProduct.category_id && product.id !== fallbackProduct.id
      )
      .slice(0, 4);

    return {
      product: fallbackProduct,
      reviews: buildMockReviews(fallbackProduct),
      related,
      colorImages: [],
      isFallback: true,
    };
  }
};

export const useProductsQuery = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60,
  });

export const useProductQuery = (productId?: string) =>
  useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId as string),
    enabled: Boolean(productId),
    staleTime: 1000 * 60,
  });
