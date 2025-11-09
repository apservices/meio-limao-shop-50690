import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MercadoPagoCheckoutProps {
  orderId: string;
  disabled?: boolean;
}

const MercadoPagoCheckout = ({ orderId, disabled }: MercadoPagoCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-mercado-pago-payment', {
        body: { 
          orderId,
        }
      });

      if (error) {
        throw error;
      }

      if (data?.init_point) {
        // Redirect to Mercado Pago checkout
        window.location.href = data.init_point;
      } else {
        throw new Error('Não foi possível criar o pagamento');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={disabled || loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        "Pagar com Mercado Pago"
      )}
    </Button>
  );
};

export default MercadoPagoCheckout;
