import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityNotificationRequest {
  event_type: "2fa_enabled" | "2fa_disabled" | "login_new_device" | "password_changed" | "admin_access";
  user_email?: string;
  metadata?: Record<string, any>;
}

const getEmailContent = (eventType: string, metadata?: Record<string, any>) => {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    color: #333;
  `;
  
  switch (eventType) {
    case "2fa_enabled":
      return {
        subject: "🔐 Autenticação de dois fatores ativada - Meio Limão",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #2d5016;">Autenticação de Dois Fatores Ativada</h1>
            <p>Sua conta agora está protegida com autenticação de dois fatores (2FA).</p>
            <p>A partir de agora, você precisará fornecer um código do seu aplicativo autenticador ao fazer login.</p>
            <div style="background: #f0f9e8; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <strong>Códigos de backup:</strong>
              <p style="font-size: 14px;">Guarde seus códigos de backup em um local seguro. Eles são a única forma de acessar sua conta caso perca acesso ao seu autenticador.</p>
            </div>
            <p style="color: #666; font-size: 12px;">Se você não realizou esta ação, entre em contato imediatamente com nosso suporte.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 11px;">Meio Limão - Moda Feminina Tropical Chic</p>
          </div>
        `,
      };
    
    case "2fa_disabled":
      return {
        subject: "⚠️ Autenticação de dois fatores desativada - Meio Limão",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #d97706;">Autenticação de Dois Fatores Desativada</h1>
            <p>A autenticação de dois fatores foi <strong>desativada</strong> na sua conta.</p>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <strong>⚠️ Atenção:</strong>
              <p style="font-size: 14px;">Sua conta agora está menos protegida. Recomendamos reativar o 2FA para maior segurança.</p>
            </div>
            <p style="color: #666; font-size: 12px;">Se você não realizou esta ação, altere sua senha imediatamente e entre em contato com nosso suporte.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 11px;">Meio Limão - Moda Feminina Tropical Chic</p>
          </div>
        `,
      };
    
    case "admin_access":
      return {
        subject: "🛡️ Acesso ao painel administrativo - Meio Limão",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #1e40af;">Acesso ao Painel Administrativo</h1>
            <p>Um acesso ao painel administrativo foi registrado na sua conta.</p>
            <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <strong>Detalhes do acesso:</strong>
              <ul style="font-size: 14px; margin: 10px 0;">
                <li>Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</li>
                ${metadata?.ip ? `<li>IP: ${metadata.ip}</li>` : ''}
                ${metadata?.userAgent ? `<li>Navegador: ${metadata.userAgent}</li>` : ''}
              </ul>
            </div>
            <p style="color: #666; font-size: 12px;">Se você não reconhece este acesso, altere sua senha imediatamente.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 11px;">Meio Limão - Moda Feminina Tropical Chic</p>
          </div>
        `,
      };
    
    case "login_new_device":
      return {
        subject: "🔔 Novo login detectado - Meio Limão",
        html: `
          <div style="${baseStyles}">
            <h1 style="color: #1e40af;">Novo Login Detectado</h1>
            <p>Um novo login foi realizado na sua conta.</p>
            <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <strong>Detalhes:</strong>
              <ul style="font-size: 14px; margin: 10px 0;">
                <li>Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</li>
                ${metadata?.ip ? `<li>IP: ${metadata.ip}</li>` : ''}
                ${metadata?.userAgent ? `<li>Dispositivo: ${metadata.userAgent}</li>` : ''}
              </ul>
            </div>
            <p style="color: #666; font-size: 12px;">Se você não reconhece este login, altere sua senha imediatamente.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 11px;">Meio Limão - Moda Feminina Tropical Chic</p>
          </div>
        `,
      };
    
    default:
      return {
        subject: "Notificação de Segurança - Meio Limão",
        html: `
          <div style="${baseStyles}">
            <h1>Notificação de Segurança</h1>
            <p>Uma ação de segurança foi registrada na sua conta.</p>
            <p style="color: #666; font-size: 12px;">Se você não realizou esta ação, entre em contato com nosso suporte.</p>
          </div>
        `,
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const { event_type, user_email, metadata }: SecurityNotificationRequest = await req.json();
    
    let targetEmail = user_email;
    
    // If no email provided, try to get from authenticated user
    if (!targetEmail && authHeader) {
      const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user?.email) {
        targetEmail = user.email;
      }
    }
    
    if (!targetEmail) {
      throw new Error("No email address provided or found");
    }

    const emailContent = getEmailContent(event_type, metadata);

    console.log(`Sending security notification: ${event_type} to ${targetEmail}`);

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Meio Limão <no-reply@meiolimao.shop>",
        to: [targetEmail],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    // Log to audit_logs
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase.from("audit_logs").insert({
      entity: "security_notification",
      action: event_type,
      diff: { email: targetEmail, metadata },
    });

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending security notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
