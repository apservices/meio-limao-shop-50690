import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: {
          email,
          source: "newsletter_popup",
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Cadastro confirmado! Seu cupom já está a caminho do seu e-mail.");
      localStorage.setItem("newsletter-popup-seen", "true");
      setOpen(false);
      setEmail("");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Não conseguimos salvar seu cadastro. Tente novamente.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem("newsletter-popup-seen", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="text-center space-y-4 py-6">
          <div className="text-5xl mb-2">🍋</div>
          <h2 className="text-2xl font-serif font-semibold">Bem-vinda ao 1/2 Limão</h2>
          <p className="text-muted-foreground">
            Cadastre-se e ganhe <span className="font-semibold text-primary">10% OFF</span> na primeira compra
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-3 pt-4">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-center"
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Cadastrando..." : "Quero meu cupom BEMVINDAX"}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground">
            Ao se cadastrar você aceita receber novidades e ofertas exclusivas
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
