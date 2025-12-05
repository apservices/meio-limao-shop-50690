import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Verify2FA = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const returnPath = (location.state as { from?: string })?.from || "/";

  useEffect(() => {
    const fetchMfaSecret = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_mfa")
          .select("secret")
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          // User doesn't have 2FA, redirect to destination
          navigate(returnPath);
          return;
        }

        setSecret(data.secret);
      } catch (error) {
        console.error("Error fetching MFA secret:", error);
        navigate(returnPath);
      } finally {
        setLoadingSecret(false);
      }
    };

    fetchMfaSecret();
  }, [user, navigate, returnPath]);

  const handleVerify = async () => {
    if (code.length !== 6 || !secret) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-totp", {
        body: { secret, token: code },
      });

      if (error || !data.valid) {
        throw new Error("Código inválido");
      }

      // Store 2FA verification in session
      sessionStorage.setItem(`2fa_verified_${user?.id}`, Date.now().toString());

      toast({
        title: "Verificado!",
        description: "Autenticação de dois fatores confirmada.",
      });

      navigate(returnPath);
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      toast({
        title: "Código inválido",
        description: "O código está incorreto ou expirado. Tente novamente.",
        variant: "destructive",
      });
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) {
      handleVerify();
    }
  };

  if (loadingSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Verificação de Dois Fatores</CardTitle>
          <CardDescription>
            Insira o código de 6 dígitos do seu aplicativo autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.) e insira o código atual.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="2fa-code">Código de Autenticação</Label>
            <Input
              id="2fa-code"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full"
          >
            {loading ? "Verificando..." : "Verificar e Continuar"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Não consegue acessar seu autenticador? Entre em contato com o suporte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify2FA;
