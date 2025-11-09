import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Integração com serviço de email
    console.log("Newsletter:", email);
    setEmail("");
  };

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🍋</div>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Frescor na sua caixa de entrada
          </h2>
          <p className="text-muted-foreground mb-8">
            Receba novidades, looks exclusivos e 15% OFF na sua primeira compra com o cupom{" "}
            <span className="font-semibold text-primary">BEMVINDAX</span>
          </p>
          
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" size="lg">
              Cadastrar
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-4">
            Ao se cadastrar você aceita nossa política de privacidade
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
