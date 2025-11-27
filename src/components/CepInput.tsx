import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCepLookup } from "@/hooks/useCepLookup";

interface CepInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound?: (address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  }) => void;
  error?: string;
  disabled?: boolean;
}

export const CepInput = ({ 
  value, 
  onChange, 
  onAddressFound,
  error,
  disabled 
}: CepInputProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const { fetchCep, isLoading } = useCepLookup();

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formatCep = (val: string) => {
    const numbers = val.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setDisplayValue(formatted);
    const numbers = formatted.replace(/\D/g, "");
    onChange(numbers);
  };

  const handleBlur = async () => {
    const cleanCep = value.replace(/\D/g, "");
    if (cleanCep.length === 8 && onAddressFound) {
      const data = await fetchCep(cleanCep);
      if (data && !data.erro) {
        onAddressFound({
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        });
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cep">CEP *</Label>
      <div className="relative">
        <Input
          id="cep"
          type="text"
          placeholder="00000-000"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={9}
          disabled={disabled || isLoading}
          className={error ? "border-destructive" : ""}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Digite o CEP e preencheremos o endereço automaticamente
      </p>
    </div>
  );
};
