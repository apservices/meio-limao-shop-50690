import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("newsletter-popup-seen", "true");
    setOpen(false);
    // Aqui você integraria com seu serviço de email
    console.log("Email cadastrado:", email);
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
            <Button type="submit" className="w-full" size="lg">
              Quero meu cupom BEMVINDAX
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
