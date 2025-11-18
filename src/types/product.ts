import type { Tables } from "@/integrations/supabase/types";

export type ProductRow = Tables<"products">;
export type CategoryRow = Tables<"categories">;
export type ProductVariantRow = Tables<"product_variants">;
export type ReviewRow = Tables<"reviews">;
export type CustomerRow = Tables<"customers">;

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ProductWithRelations = ProductRow & {
  categories?: CategoryRow | null;
  product_variants?: ProductVariantRow[];
  product_images?: ProductImage[];
};

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  category?: string | null;
  categoryId?: string | null;
  description?: string | null;
  rating?: number | null;
  reviews?: number | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  isNew?: boolean | null;
}

export interface NormalizedReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
  verified: boolean;
}

export type ReviewWithCustomer = ReviewRow & {
  customers?: CustomerRow | null;
};

export const getPrimaryImageUrl = (product: ProductWithRelations) => {
  const sortedImages = product.product_images
    ?.slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    sortedImages?.find((image) => image.is_primary)?.image_url ??
    sortedImages?.[0]?.image_url ??
    product.image_url ??
    product.images?.[0] ??
    null
  );
};

export const toProduct = (product: ProductWithRelations): Product => ({
  id: product.id,
  name: product.name,
  price: product.price,
  originalPrice: product.original_price,
  image: getPrimaryImageUrl(product),
  category: product.categories?.name ?? "Moda",
  categoryId: product.category_id,
  description: product.description,
  rating: product.rating,
  reviews: product.reviews_count,
  sizes: product.sizes,
  colors: product.colors,
  isNew: product.is_new,
});
