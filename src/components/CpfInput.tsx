import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CpfInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cleanCpf.charAt(10))) return false;
  
  return true;
};

const formatCpf = (val: string) => {
  const numbers = val.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

export const CpfInput = ({ 
  value, 
  onChange, 
  error,
  disabled,
  label = "CPF",
  required = false
}: CpfInputProps) => {
  const [displayValue, setDisplayValue] = useState(formatCpf(value));
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setDisplayValue(formatCpf(value));
  }, [value]);

  useEffect(() => {
    const cleanCpf = value.replace(/\D/g, "");
    if (cleanCpf.length === 11) {
      setIsValid(validateCPF(cleanCpf));
    } else if (cleanCpf.length === 0) {
      setIsValid(null);
    } else if (touched) {
      setIsValid(false);
    }
  }, [value, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setDisplayValue(formatted);
    const numbers = formatted.replace(/\D/g, "");
    onChange(numbers);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cpf">
        {label} {required && "*"}
      </Label>
      <div className="relative">
        <Input
          id="cpf"
          type="text"
          placeholder="000.000.000-00"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={14}
          disabled={disabled}
          className={cn(
            error && "border-destructive",
            isValid === true && "border-green-500 focus-visible:ring-green-500",
            isValid === false && touched && "border-destructive"
          )}
        />
        {touched && isValid !== null && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {touched && isValid === false && !error && (
        <p className="text-sm text-destructive">CPF inválido</p>
      )}
      {touched && isValid === true && (
        <p className="text-sm text-green-600">CPF válido</p>
      )}
    </div>
  );
};
