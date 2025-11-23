import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const WISHLIST_STORAGE_KEY = "meio-limao-wishlist";

type WishlistProductRecord = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | string | null;
  original_price: number | string | null;
  image_url: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_new: boolean | null;
  rating: number | string | null;
  reviews_count: number | null;
  category: { name: string | null } | null;
};

type WishlistQueryResult = {
  id: string;
  wishlist_items: {
    product_id: string;
    product: WishlistProductRecord | null;
  }[];
};

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [localReady, setLocalReady] = useState(false);
  const [hasHydratedRemote, setHasHydratedRemote] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { items?: Product[]; wishlistId?: string | null };
        if (parsed.items) setItems(parsed.items);
        if (parsed.wishlistId) setWishlistId(parsed.wishlistId);
      } catch (error) {
        console.error("Failed to parse wishlist storage", error);
      }
    }
    setLocalReady(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const ensureCustomer = async (user: User | null) => {
      if (!user) {
        if (isMounted) {
          setCustomerId(null);
          setWishlistId(null);
        }
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer for wishlist", error);
        return;
      }

      if (data) {
        if (isMounted) setCustomerId(data.id);
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata as { full_name?: string })?.full_name ?? user.email ?? "",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating customer for wishlist", insertError);
        return;
      }

      if (isMounted) setCustomerId(created.id);
    };

    supabase.auth.getUser().then(({ data }) => ensureCustomer(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      ensureCustomer(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!customerId) {
      setHasHydratedRemote(false);
      return;
    }

    let isCancelled = false;
    setHasHydratedRemote(false);

    const loadRemoteWishlist = async () => {
      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select(`
            id,
            wishlist_items (
              product_id,
              product:products (
                id,
                name,
                description,
                price,
                original_price,
                image_url,
                sizes,
                colors,
                is_new,
                rating,
                reviews_count,
                category:categories ( name )
              )
            )
          `)
          .eq("customer_id", customerId)
          .maybeSingle<WishlistQueryResult>();

        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error loading wishlist", error);
          }
          return;
        }

        if (!data) return;

        if (!isCancelled) {
          setWishlistId(data.id);
        }

        if (data.wishlist_items && !isCancelled) {
          const remoteProducts = data.wishlist_items
            .map((item) => item.product)
            .filter((product): product is NonNullable<typeof product> => Boolean(product))
            .map((product) => ({
              id: product.id,
              name: product.name ?? "Produto",
              price: Number(product.price ?? 0),
              originalPrice: product.original_price ? Number(product.original_price) : undefined,
              image: product.image_url ?? "",
              category: product.category?.name ?? "",
              description: product.description ?? "",
              sizes: product.sizes ?? [],
              colors: product.colors ?? [],
              isNew: product.is_new ?? undefined,
              rating: product.rating ? Number(product.rating) : 0,
              reviews: product.reviews_count ?? 0,
            } satisfies Product));

          setItems((current) => {
            const map = new Map<string, Product>();
            remoteProducts.forEach((product) => {
              map.set(product.id, product);
            });
            current.forEach((product) => {
              map.set(product.id, product);
            });
            return Array.from(map.values());
          });
        }
      } finally {
        if (!isCancelled) {
          setHasHydratedRemote(true);
        }
      }
    };

    loadRemoteWishlist();

    return () => {
      isCancelled = true;
    };
  }, [customerId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify({ items, wishlistId })
    );
  }, [items, wishlistId]);

  const syncWishlist = useMemo(() => {
    return async (currentItems: Product[]) => {
      if (!customerId) return;

      try {
        let effectiveWishlistId = wishlistId;
        if (!effectiveWishlistId) {
          const { data, error } = await supabase
            .from("wishlists")
            .insert({ customer_id: customerId })
            .select()
            .single();

          if (error) throw error;
          effectiveWishlistId = data.id;
          setWishlistId(data.id);
        }

        await supabase.from("wishlist_items").delete().eq("wishlist_id", effectiveWishlistId);

        if (currentItems.length > 0) {
          const payload = currentItems.map((item) => ({
            wishlist_id: effectiveWishlistId!,
            product_id: item.id,
          }));
          const { error } = await supabase.from("wishlist_items").insert(payload);
          if (error) throw error;
        }
      } catch (error) {
        console.error("Failed to sync wishlist", error);
      }
    };
  }, [customerId, wishlistId]);

  useEffect(() => {
    if (!customerId || !localReady || !hasHydratedRemote) return;
    syncWishlist(items);
  }, [customerId, items, localReady, hasHydratedRemote, syncWishlist]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const toggleItem = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
