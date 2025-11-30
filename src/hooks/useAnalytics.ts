import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const sessionId = useRef(getSessionId());

  const trackEvent = async (
    eventType: string,
    eventData?: Record<string, any>
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.functions.invoke("track-event", {
        body: {
          event_type: eventType,
          event_data: eventData || {},
          session_id: sessionId.current,
        },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  // Track page views
  useEffect(() => {
    trackEvent("page_view", {
      path: window.location.pathname,
      url: window.location.href,
    });
  }, []);

  return {
    trackEvent,
    trackPageView: (path: string) =>
      trackEvent("page_view", { path, url: window.location.href }),
    trackProductView: (productId: string, productName: string) =>
      trackEvent("product_view", { product_id: productId, product_name: productName }),
    trackAddToCart: (productId: string, quantity: number, price: number) =>
      trackEvent("add_to_cart", { product_id: productId, quantity, price }),
    trackRemoveFromCart: (productId: string) =>
      trackEvent("remove_from_cart", { product_id: productId }),
    trackCheckoutStart: (cartValue: number, itemsCount: number) =>
      trackEvent("checkout_start", { cart_value: cartValue, items_count: itemsCount }),
    trackPurchase: (orderId: string, orderTotal: number) =>
      trackEvent("purchase", { order_id: orderId, order_total: orderTotal }),
    trackSearch: (query: string, resultsCount: number) =>
      trackEvent("search", { query, results_count: resultsCount }),
  };
};
