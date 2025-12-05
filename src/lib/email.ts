import { supabase } from "@/integrations/supabase/client";

type EmailType = "bem-vinda" | "confirmacao-pedido" | "recuperacao-senha" | "carrinho-abandonado";

interface EmailResponse {
  success: boolean;
  emailId?: string;
  error?: string;
}

const sendEmail = async (type: EmailType, to: string, data: Record<string, any>): Promise<EmailResponse> => {
  try {
    const { data: response, error } = await supabase.functions.invoke("send-transactional-email", {
      body: { type, to, data },
    });

    if (error) {
      console.error(`[Email] Error sending ${type}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: response?.emailId };
  } catch (err: any) {
    console.error(`[Email] Exception sending ${type}:`, err);
    return { success: false, error: err.message };
  }
};

/**
 * Send welcome email to new customers
 */
export const sendWelcomeEmail = async (to: string, customerName: string): Promise<EmailResponse> => {
  return sendEmail("bem-vinda", to, { customerName });
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  to: string,
  orderData: {
    customerName: string;
    orderId: string;
    orderNumber: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  }
): Promise<EmailResponse> => {
  return sendEmail("confirmacao-pedido", to, orderData);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  to: string,
  customerName: string,
  resetLink: string
): Promise<EmailResponse> => {
  return sendEmail("recuperacao-senha", to, { customerName, resetLink });
};

/**
 * Send abandoned cart reminder email
 */
export const sendAbandonedCartEmail = async (
  to: string,
  customerName: string,
  items: Array<{ name: string; price: number }>,
  cartUrl?: string
): Promise<EmailResponse> => {
  return sendEmail("carrinho-abandonado", to, { customerName, items, cartUrl });
};
