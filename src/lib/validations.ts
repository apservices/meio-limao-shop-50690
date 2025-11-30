import { z } from "zod";

// Validação de CPF
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

// Validação de Luhn (cartão de crédito)
const validateLuhn = (cardNumber: string): boolean => {
  cardNumber = cardNumber.replace(/\s/g, "");
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Schema de validação para Checkout
export const checkoutSchema = z.object({
  // Dados Pessoais
  name: z
    .string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo")
    .toLowerCase(),
  
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos")
    .transform(val => val.replace(/\D/g, "")),
  
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
    .refine(validateCPF, "CPF inválido")
    .transform(val => val.replace(/\D/g, "")),
  
  // Endereço de Cobrança
  cep: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "CEP deve ter 8 dígitos")
    .transform(val => val.replace(/\D/g, "")),
  
  street: z
    .string()
    .trim()
    .min(3, "Rua deve ter no mínimo 3 caracteres")
    .max(200, "Rua muito longa"),
  
  number: z
    .string()
    .trim()
    .min(1, "Número é obrigatório")
    .max(10, "Número muito longo"),
  
  complement: z
    .string()
    .trim()
    .max(100, "Complemento muito longo")
    .optional(),
  
  neighborhood: z
    .string()
    .trim()
    .min(2, "Bairro deve ter no mínimo 2 caracteres")
    .max(100, "Bairro muito longo"),
  
  city: z
    .string()
    .trim()
    .min(2, "Cidade deve ter no mínimo 2 caracteres")
    .max(100, "Cidade muito longa"),
  
  state: z
    .string()
    .trim()
    .length(2, "Estado deve ter 2 caracteres")
    .toUpperCase(),
  
  // Endereço de Entrega (opcional - usar o mesmo se não preenchido)
  useDifferentShippingAddress: z.boolean().default(false),
  
  shippingCep: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "CEP deve ter 8 dígitos")
    .transform(val => val.replace(/\D/g, ""))
    .optional()
    .or(z.literal("")),
  
  shippingStreet: z
    .string()
    .trim()
    .min(3, "Rua deve ter no mínimo 3 caracteres")
    .max(200, "Rua muito longa")
    .optional()
    .or(z.literal("")),
  
  shippingNumber: z
    .string()
    .trim()
    .min(1, "Número é obrigatório")
    .max(10, "Número muito longo")
    .optional()
    .or(z.literal("")),
  
  shippingComplement: z
    .string()
    .trim()
    .max(100, "Complemento muito longo")
    .optional()
    .or(z.literal("")),
  
  shippingNeighborhood: z
    .string()
    .trim()
    .min(2, "Bairro deve ter no mínimo 2 caracteres")
    .max(100, "Bairro muito longo")
    .optional()
    .or(z.literal("")),
  
  shippingCity: z
    .string()
    .trim()
    .min(2, "Cidade deve ter no mínimo 2 caracteres")
    .max(100, "Cidade muito longa")
    .optional()
    .or(z.literal("")),
  
  shippingState: z
    .string()
    .trim()
    .length(2, "Estado deve ter 2 caracteres")
    .toUpperCase()
    .optional()
    .or(z.literal("")),
  
  // Opção de presente
  isGift: z.boolean().default(false),
  giftMessage: z
    .string()
    .trim()
    .max(500, "Mensagem muito longa")
    .optional()
    .or(z.literal("")),
  
  // Pagamento (condicional - apenas se for cartão)
  paymentMethod: z.enum(["pix", "credit"]),
  
  cardNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  
  cardName: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  
  cardCvv: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  
  cardExpiry: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

// Schema de validação para Senha
export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos um caractere especial");

// Schema para Signup
export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo")
    .toLowerCase(),
  
  password: passwordSchema,
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
