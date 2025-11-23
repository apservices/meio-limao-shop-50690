import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Product } from "@/data/products";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const CART_STORAGE_KEY = "meio-limao-cart";
const CART_SESSION_KEY = "meio-limao-session";

const generateSessionId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasHydratedRemote, setHasHydratedRemote] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existingSession = localStorage.getItem(CART_SESSION_KEY);
    if (existingSession) {
      setSessionId(existingSession);
    } else {
      const newSession = generateSessionId();
      localStorage.setItem(CART_SESSION_KEY, newSession);
      setSessionId(newSession);
    }

    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart) as { items?: CartItem[]; cartId?: string | null };
        if (parsed.items) {
          setItems(parsed.items);
        }
        if (parsed.cartId) {
          setCartId(parsed.cartId);
        }
      } catch (error) {
        console.error("Failed to parse cart from storage", error);
      }
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const ensureCustomer = async (user: User | null) => {
      if (!user) {
        if (isMounted) {
          setCustomerId(null);
        }
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching customer", error);
        return;
      }

      if (data) {
        if (isMounted) setCustomerId(data.id);
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata as { full_name?: string })?.full_name ?? user.email ?? "",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating customer", createError);
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
    if (!isReady || !sessionId) return;

    let isCancelled = false;
    setHasHydratedRemote(false);

    const loadRemoteCart = async () => {
      const identifierColumn = customerId ? "customer_id" : "session_id";
      const identifierValue = customerId ?? sessionId;

      try {
        const { data, error } = await supabase
          .from("carts")
          .select("id, cart_items(*)")
          .eq(identifierColumn, identifierValue)
          .maybeSingle();

        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error loading remote cart", error);
          }
          return;
        }

        if (!data) return;

        if (!isCancelled) {
          setCartId(data.id);
        }

        if (data.cart_items && !isCancelled) {
          setItems((current) => {
            const map = new Map<string, CartItem>();

            data.cart_items.forEach((item) => {
              let size = "Único";
              let color = "Padrão";

              if (item.sku_snapshot) {
                try {
                  const parsed = JSON.parse(item.sku_snapshot) as { size?: string; color?: string };
                  if (parsed.size) size = parsed.size;
                  if (parsed.color) color = parsed.color;
                } catch (error) {
                  console.error("Failed to parse sku snapshot", error);
                }
              }

              const key = `${item.product_id}-${size}-${color}`;
              map.set(key, {
                id: item.product_id,
                name: item.name_snapshot,
                price: item.unit_price_cents / 100,
                image: item.image_url ?? "/icon-192.png",
                category: "Carrinho",
                description: item.name_snapshot,
                sizes: [],
                colors: [],
                rating: 0,
                reviews: 0,
                quantity: item.qty,
                selectedSize: size,
                selectedColor: color,
              });
            });

            current.forEach((item) => {
              const key = `${item.id}-${item.selectedSize}-${item.selectedColor}`;
              if (!map.has(key)) {
                map.set(key, item);
              }
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

    loadRemoteCart();

    return () => {
      isCancelled = true;
    };
  }, [customerId, isReady, sessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, cartId })
    );
  }, [items, cartId]);

  const syncCartToSupabase = useMemo(() => {
    return async (currentItems: CartItem[]) => {
      if (!sessionId || !isSupabaseConfigured) return;

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Failed to read Supabase session", sessionError);
        return;
      }

      if (!sessionData.session) return;

      try {
        let effectiveCartId = cartId;
        const totals = currentItems.reduce(
          (acc, item) => {
            const line = item.price * item.quantity;
            return { subtotal: acc.subtotal + line, total: acc.total + line };
          },
          { subtotal: 0, total: 0 }
        );

        const cents = {
          subtotal_cents: Math.round(totals.subtotal * 100),
          total_cents: Math.round(totals.total * 100),
        };

        if (!effectiveCartId) {
          const { data, error } = await supabase
            .from("carts")
            .insert({
              session_id: sessionId,
              customer_id: customerId,
              currency: "BRL",
              ...cents,
            })
            .select()
            .single();

          if (error) throw error;
          effectiveCartId = data.id;
          setCartId(data.id);
        } else {
          const { error } = await supabase
            .from("carts")
            .update({
              customer_id: customerId ?? undefined,
              ...cents,
            })
            .eq("id", effectiveCartId);

          if (error) throw error;
        }

        await supabase.from("cart_items").delete().eq("cart_id", effectiveCartId);

        if (currentItems.length > 0) {
          const payload = currentItems.map((item) => ({
            cart_id: effectiveCartId!,
            product_id: item.id,
            name_snapshot: item.name,
            unit_price_cents: Math.round(item.price * 100),
            qty: item.quantity,
            image_url: item.image,
            sku_snapshot: JSON.stringify({ size: item.selectedSize, color: item.selectedColor }),
          }));

          const { error } = await supabase.from("cart_items").insert(payload);
          if (error) throw error;
        }
      } catch (error) {
        console.error("Failed to sync cart with Supabase", error);
      }
    };
  }, [cartId, customerId, sessionId]);

  useEffect(() => {
    if (!isReady || !sessionId || !hasHydratedRemote) return;
    syncCartToSupabase(items);
  }, [items, sessionId, customerId, isReady, hasHydratedRemote, syncCartToSupabase]);

  const addItem = (product: Product, size: string, color: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );
      
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const removeItem = (id: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedSize === size && item.selectedColor === color))
    );
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size, color);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
