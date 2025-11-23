import { useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  company?: { name: string; picture?: string | null };
  delivery_time?: { days?: number; formatted?: string };
  custom_delivery_time?: string;
}

const ShippingCalculator = () => {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<ShippingOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatDeliveryLabel = (option: ShippingOption) => {
    if (option.custom_delivery_time) return option.custom_delivery_time;
    if (option.delivery_time?.formatted) return option.delivery_time.formatted;
    if (option.delivery_time?.days) return `${option.delivery_time.days} dia(s) útil(eis)`;
    return "Prazo indisponível";
  };

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
              id: 'sample',
              width: 16,
              height: 2,
              length: 23,
              weight: 0.3,
              price: 50,
              quantity: 1,
            }
          ]
        }
      });

      if (error) {
        throw new Error(error.message || 'Falha ao calcular frete');
      }

      if (data?.error) {
        const details = Array.isArray(data.details)
          ? data.details.find((d: any) => typeof d?.message === 'string')?.message
          : typeof data.details === 'string'
          ? data.details
          : undefined;

        throw new Error(
          details || (typeof data.error === 'string'
            ? data.error
            : 'Não foi possível calcular o frete para este CEP')
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Não foi possível calcular o frete para este CEP'
        );
      }

      if (data?.options && data.options.length > 0) {
        setResult(data.options as ShippingOption[]);
      } else {
        throw new Error('Nenhuma opção de frete encontrada para o CEP informado');
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      toast({
        title: "Erro ao calcular frete",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes",
        variant: "destructive",
      });
      setResult(null);
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
          {result.map((option) => (
            <div key={option.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium text-foreground">{option.company?.name} - {option.name}</p>
                <p className="text-muted-foreground">
                  {formatDeliveryLabel(option)}
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
