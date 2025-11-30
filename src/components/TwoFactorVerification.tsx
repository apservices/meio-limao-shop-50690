import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorVerificationProps {
  secret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorVerification = ({ secret, onSuccess, onCancel }: TwoFactorVerificationProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { secret, token: code },
      });

      if (error || !data.valid) {
        throw new Error("Código inválido");
      }

      toast({
        title: "Verificado!",
        description: "Código de autenticação verificado com sucesso.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast({
        title: "Erro",
        description: "Código inválido ou expirado. Tente novamente.",
        variant: "destructive",
      });
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verificação de Dois Fatores
        </CardTitle>
        <CardDescription>
          Insira o código de 6 dígitos do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="2fa-code">Código de Autenticação</Label>
          <Input
            id="2fa-code"
            type="text"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest font-mono"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="flex-1"
          >
            {loading ? "Verificando..." : "Verificar"}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Não consegue acessar seu autenticador? Entre em contato com o suporte.
        </p>
      </CardContent>
    </Card>
  );
};
