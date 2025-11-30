import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";

export const TwoFactorSetup = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [step, setStep] = useState<'initial' | 'setup' | 'verify' | 'complete'>('initial');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateSecret = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-totp-secret');
      
      if (error) throw error;
      
      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setStep('setup');
    } catch (error) {
      console.error('Erro ao gerar secret:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o código de autenticação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First verify the code
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-totp', {
        body: { secret, token: verificationCode },
      });

      if (verifyError || !verifyData.valid) {
        throw new Error("Código inválido ou expirado");
      }

      // Then enable MFA
      const { data: enableData, error: enableError } = await supabase.functions.invoke('enable-mfa', {
        body: { secret },
      });

      if (enableError) throw enableError;

      setBackupCodes(enableData.backupCodes);
      setStep('complete');
      
      toast({
        title: "2FA Ativado!",
        description: "Autenticação de dois fatores configurada com sucesso.",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast({
        title: "Erro",
        description: "Código inválido ou expirado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência.",
    });
  };

  if (step === 'initial') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A autenticação de dois fatores adiciona segurança à sua conta exigindo um código gerado
            por um aplicativo autenticador (como Google Authenticator ou Authy) além da sua senha.
          </p>
          <Button onClick={handleGenerateSecret} disabled={loading}>
            {loading ? "Gerando..." : "Ativar 2FA"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configure seu Autenticador</CardTitle>
          <CardDescription>
            Escaneie o QR code com seu aplicativo autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={qrCodeUrl} size={200} />
            </div>
            
            <div className="w-full">
              <Label>Ou insira este código manualmente:</Label>
              <div className="flex gap-2 mt-2">
                <Input value={secret} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(secret)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-code">
              Código de Verificação (6 dígitos)
            </Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-lg tracking-widest font-mono"
            />
          </div>

          <Button
            onClick={handleVerifyAndEnable}
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading ? "Verificando..." : "Verificar e Ativar"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">2FA Ativado com Sucesso!</CardTitle>
          <CardDescription>
            Salve seus códigos de backup em um local seguro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Importante:</strong> Guarde estes códigos de backup em um local seguro.
              Cada código pode ser usado uma vez caso você perca acesso ao seu autenticador.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            {backupCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm flex justify-between items-center">
                <span>{code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(code)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={() => copyToClipboard(backupCodes.join('\n'))}
            variant="outline"
            className="w-full"
          >
            Copiar Todos os Códigos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};
