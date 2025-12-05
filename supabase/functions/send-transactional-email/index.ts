import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "bem-vinda" | "confirmacao-pedido" | "recuperacao-senha" | "carrinho-abandonado";
  to: string;
  data: Record<string, any>;
}

// Meio Limão brand styles
const brandStyles = {
  backgroundColor: "#fffaf2",
  cardBackground: "#fef7e8",
  primaryGreen: "#3a7c3a",
  darkGreen: "#1f3b1f",
  borderRadius: "18px",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${brandStyles.backgroundColor}; font-family: ${brandStyles.fontFamily};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${brandStyles.backgroundColor};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: ${brandStyles.cardBackground}; border-radius: ${brandStyles.borderRadius}; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 24px 16px; background-color: ${brandStyles.primaryGreen};">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">MEIO LIMÃO</h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 2px;">moda feminina tropical chic</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px; border-top: 1px solid rgba(0,0,0,0.08);">
              <p style="margin: 0 0 8px; font-size: 13px; color: ${brandStyles.darkGreen};">
                <a href="https://meiolimao.shop" style="color: ${brandStyles.primaryGreen}; text-decoration: none;">meiolimao.shop</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #888;">
                © ${new Date().getFullYear()} Meio Limão. Todos os direitos reservados.
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #aaa;">
                WhatsApp: +55 11 97350-0848
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getButton = (text: string, url: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px auto;">
  <tr>
    <td align="center" style="background-color: ${brandStyles.primaryGreen}; border-radius: 12px;">
      <a href="${url}" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const getEmailContent = (type: string, data: Record<string, any>) => {
  const siteUrl = "https://meiolimao.shop";

  switch (type) {
    case "bem-vinda": {
      const { customerName } = data;
      return {
        subject: "💛 Bem-vinda à Meio Limão!",
        html: getBaseTemplate(`
          <h2 style="margin: 0 0 16px; font-size: 22px; color: ${brandStyles.darkGreen};">
            Oi, ${customerName} ✨
          </h2>
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #333;">
            Bem-vinda à <strong>Meio Limão</strong> – vista o frescor, sinta a energia.
          </p>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #333;">
            Estamos felizes em ter você com a gente! Preparamos uma coleção especial de peças tropicais que combinam conforto, estilo e brasilidade.
          </p>
          
          <div style="background: linear-gradient(135deg, ${brandStyles.primaryGreen}, ${brandStyles.darkGreen}); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px;">presente de boas-vindas</p>
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #fff;">10% OFF</p>
            <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">na sua primeira compra 💛</p>
          </div>
          
          ${getButton("Descobrir a coleção", siteUrl)}
          
          <p style="margin: 24px 0 0; font-size: 13px; color: #666; text-align: center;">
            Use o código <strong style="color: ${brandStyles.primaryGreen};">BEMVINDA10</strong> no checkout
          </p>
        `),
      };
    }

    case "confirmacao-pedido": {
      const { customerName, orderId, orderNumber, items, subtotal, shipping, discount, total } = data;
      
      const itemsHtml = items.map((item: any) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.06);">
            <p style="margin: 0; font-size: 14px; color: #333;">${item.name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #888;">Qtd: ${item.quantity}</p>
          </td>
          <td align="right" style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.06);">
            <p style="margin: 0; font-size: 14px; color: #333; font-weight: 500;">${formatCurrency(item.price * item.quantity)}</p>
          </td>
        </tr>
      `).join("");

      return {
        subject: `✅ Pedido #${orderNumber} confirmado - Meio Limão`,
        html: getBaseTemplate(`
          <h2 style="margin: 0 0 16px; font-size: 22px; color: ${brandStyles.darkGreen};">
            Oi, ${customerName} 💛
          </h2>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #333;">
            Seu pedido <strong>#${orderNumber}</strong> foi recebido com sucesso! Estamos preparando tudo com muito carinho.
          </p>
          
          <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 16px; font-size: 16px; color: ${brandStyles.darkGreen}; border-bottom: 2px solid ${brandStyles.primaryGreen}; padding-bottom: 12px;">
              Resumo do pedido
            </h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${itemsHtml}
              <tr>
                <td style="padding: 12px 0 4px;">
                  <p style="margin: 0; font-size: 13px; color: #666;">Subtotal</p>
                </td>
                <td align="right" style="padding: 12px 0 4px;">
                  <p style="margin: 0; font-size: 13px; color: #666;">${formatCurrency(subtotal)}</p>
                </td>
              </tr>
              ${discount > 0 ? `
              <tr>
                <td style="padding: 4px 0;">
                  <p style="margin: 0; font-size: 13px; color: ${brandStyles.primaryGreen};">Desconto</p>
                </td>
                <td align="right" style="padding: 4px 0;">
                  <p style="margin: 0; font-size: 13px; color: ${brandStyles.primaryGreen};">-${formatCurrency(discount)}</p>
                </td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 4px 0;">
                  <p style="margin: 0; font-size: 13px; color: #666;">Frete</p>
                </td>
                <td align="right" style="padding: 4px 0;">
                  <p style="margin: 0; font-size: 13px; color: #666;">${shipping === 0 ? "Grátis" : formatCurrency(shipping)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 0 0; border-top: 2px solid ${brandStyles.primaryGreen};">
                  <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${brandStyles.darkGreen};">Total</p>
                </td>
                <td align="right" style="padding: 16px 0 0; border-top: 2px solid ${brandStyles.primaryGreen};">
                  <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${brandStyles.darkGreen};">${formatCurrency(total)}</p>
                </td>
              </tr>
            </table>
          </div>
          
          ${getButton("Acompanhar pedido", `${siteUrl}/account`)}
          
          <p style="margin: 24px 0 0; font-size: 13px; color: #666; text-align: center;">
            Você receberá atualizações sobre o envio por e-mail.
          </p>
        `),
      };
    }

    case "recuperacao-senha": {
      const { customerName, resetLink } = data;
      return {
        subject: "🔐 Redefinir sua senha - Meio Limão",
        html: getBaseTemplate(`
          <h2 style="margin: 0 0 16px; font-size: 22px; color: ${brandStyles.darkGreen};">
            Oi, ${customerName || "cliente"} 🍋
          </h2>
          <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #333;">
            Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
          </p>
          
          <div style="background: #fff3cd; border-radius: 12px; padding: 16px; margin: 24px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              ⏰ Este link é válido por <strong>24 horas</strong>.
            </p>
          </div>
          
          ${getButton("Redefinir senha", resetLink)}
          
          <p style="margin: 24px 0 0; font-size: 13px; color: #666; text-align: center;">
            Se você não solicitou a redefinição de senha, ignore este e-mail. Sua conta permanece segura.
          </p>
        `),
      };
    }

    case "carrinho-abandonado": {
      const { customerName, items, cartUrl } = data;
      
      const itemsPreview = items.slice(0, 3).map((item: any) => `
        <div style="display: inline-block; margin: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #333;">${item.name}</p>
          <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: ${brandStyles.primaryGreen};">${formatCurrency(item.price)}</p>
        </div>
      `).join("");

      return {
        subject: "✨ Você esqueceu algo especial - Meio Limão",
        html: getBaseTemplate(`
          <h2 style="margin: 0 0 16px; font-size: 22px; color: ${brandStyles.darkGreen};">
            Oi, ${customerName || "linda"} ✨
          </h2>
          <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #333;">
            Notamos que você deixou algumas peças especiais no seu carrinho. Elas ainda estão esperando por você!
          </p>
          
          <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid rgba(0,0,0,0.08); text-align: center;">
            <h3 style="margin: 0 0 16px; font-size: 14px; color: ${brandStyles.darkGreen}; text-transform: uppercase; letter-spacing: 1px;">
              Suas peças estão te esperando 💛
            </h3>
            ${itemsPreview}
            ${items.length > 3 ? `<p style="margin: 12px 0 0; font-size: 12px; color: #888;">+ ${items.length - 3} item(ns) no carrinho</p>` : ""}
          </div>
          
          ${getButton("Voltar ao carrinho", cartUrl || `${siteUrl}/cart`)}
          
          <p style="margin: 24px 0 0; font-size: 13px; color: #666; text-align: center;">
            Aproveite – estoque limitado!
          </p>
        `),
      };
    }

    default:
      return {
        subject: "Meio Limão",
        html: getBaseTemplate(`
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #333;">
            Obrigada por fazer parte da Meio Limão!
          </p>
        `),
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const { type, to, data }: EmailRequest = await req.json();

    if (!type || !to) {
      throw new Error("Missing required fields: type and to");
    }

    console.log(`[Transactional Email] Sending ${type} to ${to}`);

    const emailContent = getEmailContent(type, data);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Meio Limão <no-reply@meiolimao.shop>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("[Transactional Email] Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("[Transactional Email] Email sent successfully:", emailResult);

    // Log to audit_logs
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("audit_logs").insert({
        entity: "transactional_email",
        action: type,
        diff: { to, type, emailId: emailResult.id },
      });
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResult.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[Transactional Email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
