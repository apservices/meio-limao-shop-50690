import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, LogOut, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

const AccountSecurity = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkMfaStatus();
    loadSessions();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("user_mfa")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setMfaEnabled(true);
      }
    } catch (error) {
      console.error("Erro ao verificar status 2FA:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("last_activity", { ascending: false });

      if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Tem certeza que deseja desativar a autenticação de dois fatores?")) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('disable-mfa');
      
      if (error) throw error;

      setMfaEnabled(false);
      toast({
        title: "2FA Desativado",
        description: "Autenticação de dois fatores desativada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao desativar 2FA:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o 2FA. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Sessão Revogada",
        description: "A sessão foi encerrada com sucesso.",
      });
      
      loadSessions();
    } catch (error) {
      console.error("Erro ao revogar sessão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível revogar a sessão.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Segurança da Conta - Meio Limão</title>
        <meta name="description" content="Configure a segurança da sua conta com autenticação de dois fatores e gerencie suas sessões ativas." />
      </Helmet>

      <Navbar />
      
      <main className="container mx-auto px-4 py-12 pb-24 md:pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold mb-2">Segurança da Conta</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações de segurança da sua conta
            </p>
          </div>

          {/* 2FA Section */}
          <div>
            {loading ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">Carregando...</p>
                </CardContent>
              </Card>
            ) : mfaEnabled ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Autenticação de Dois Fatores Ativa
                  </CardTitle>
                  <CardDescription>
                    Sua conta está protegida com 2FA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <AlertDescription>
                      A autenticação de dois fatores está ativa. Você precisará fornecer um código
                      do seu aplicativo autenticador ao fazer login.
                    </AlertDescription>
                  </Alert>
                  <Button variant="destructive" onClick={handleDisable2FA}>
                    Desativar 2FA
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <TwoFactorSetup onSuccess={() => setMfaEnabled(true)} />
            )}
          </div>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessões Ativas
              </CardTitle>
              <CardDescription>
                Gerencie os dispositivos conectados à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma sessão ativa no momento.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{session.user_agent || "Dispositivo desconhecido"}</p>
                        <p className="text-sm text-muted-foreground">
                          IP: {session.ip_address || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Última atividade: {new Date(session.last_activity).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Revogar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default AccountSecurity;
