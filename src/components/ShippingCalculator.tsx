import { useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ShippingCalculator = () => {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-shipping', {
        body: { 
          cep,
          items: [
            {
              id: '1',
              width: 11,
              height: 2,
              length: 16,
              weight: 0.3,
              price: 50,
              quantity: 1,
            }
          ]
        }
      });

      if (error) throw error;

      if (data?.options && data.options.length > 0) {
        setResult(data.options);
      } else {
        toast({
          title: "Nenhuma opção encontrada",
          description: "Não foi possível calcular o frete para este CEP",
          variant: "destructive",
        });
        setResult(null);
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      toast({
        title: "Erro ao calcular frete",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <Package className="h-5 w-5 text-primary" />
        <span className="font-medium">Calcular frete</span>
      </div>
      <form onSubmit={handleCalculate} className="flex gap-2">
        <Input
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
          maxLength={8}
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "OK"}
        </Button>
      </form>
      {result && result.length > 0 && (
        <div className="text-xs space-y-2 mt-3">
          {result.map((option: any) => (
            <div key={option.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium text-foreground">{option.company.name} - {option.name}</p>
                <p className="text-muted-foreground">
                  {option.custom_delivery_time} dias úteis
                </p>
              </div>
              <p className="font-semibold text-foreground">
                R$ {option.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
