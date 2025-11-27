import { useState, ChangeEvent } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus("idle");
    setStatusMessage(null);

    try {
      const { error } = await supabase.functions.invoke("submit-contact", {
        body: {
          ...formData,
          source: "contact_page",
        },
      });

      if (error) {
        throw error;
      }

      setFormStatus("success");
      setStatusMessage("Mensagem enviada! Responderemos em breve.");
      toast.success("Mensagem enviada! Responderemos em breve.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Não conseguimos enviar sua mensagem. Tente novamente.";
      setFormStatus("error");
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Contato - Meio Limão</title>
        <meta
          name="description"
          content="Entre em contato com a Meio Limão. Estamos aqui para ajudar com suas dúvidas sobre produtos, pedidos e trocas."
        />
      </Helmet>

      <Navbar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                Fale Conosco
              </h1>
              <p className="text-lg text-muted-foreground">
                Estamos aqui para ajudar! Entre em contato através dos nossos canais.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-sm">
                <h2 className="font-serif text-2xl font-semibold mb-6">
                  Envie sua Mensagem
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      required
                      className="mt-1.5"
                      value={formData.name}
                      onChange={handleChange("name")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="mt-1.5"
                      value={formData.email}
                      onChange={handleChange("email")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="mt-1.5"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      placeholder="Como podemos ajudar?"
                      required
                      className="mt-1.5"
                      value={formData.subject}
                      onChange={handleChange("subject")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Escreva sua mensagem aqui..."
                      rows={5}
                      required
                      className="mt-1.5"
                      value={formData.message}
                      onChange={handleChange("message")}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                  {statusMessage && (
                    <p
                      className={`text-sm text-center ${
                        formStatus === "error" ? "text-destructive" : "text-emerald-600"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  )}
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-sm">
                  <h2 className="font-serif text-2xl font-semibold mb-6">
                    Outras Formas de Contato
                  </h2>
                  <div className="space-y-6">
                    <a
                      href="https://wa.me/5511973500848"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">WhatsApp</h3>
                        <p className="text-sm text-muted-foreground">
                          Atendimento rápido e direto
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          (11) 97350-0848
                        </p>
                      </div>
                    </a>

                    <div className="flex items-start gap-4 p-4 rounded-xl">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">E-mail</h3>
                        <p className="text-sm text-muted-foreground">
                          Respondemos em até 24h
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          contato@meiolimao.com.br
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Telefone</h3>
                        <p className="text-sm text-muted-foreground">
                          Seg a Sex, 9h às 18h
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          (11) 3000-0000
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://instagram.com/meiolimao"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Instagram className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Instagram</h3>
                        <p className="text-sm text-muted-foreground">
                          Acompanhe novidades e looks
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          @meiolimao
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Endereço</h3>
                      <p className="text-sm text-muted-foreground">
                        Rua das Flores, 123
                        <br />
                        Jardim Paulista - São Paulo/SP
                        <br />
                        CEP: 01234-567
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default Contact;
