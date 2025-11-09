import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5511999999999?text=Olá! Vim do site e gostaria de mais informações."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-6 z-40 group"
    >
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-[var(--shadow-hover)] hover:scale-110 transition-transform duration-300 bg-[#25D366] hover:bg-[#20BD5A]"
      >
        <MessageCircle className="h-7 w-7 text-white fill-white" />
      </Button>
      
      {/* Tooltip */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Fale conosco no WhatsApp
      </div>
    </a>
  );
};

export default WhatsAppButton;
