import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { CreditCard, Loader2, Smartphone, Truck } from "lucide-react";
import { checkoutSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type ShippingOption = {
  id: string;
  name: string;
  company: {
    name: string;
    picture?: string | null;
  };
  price: number;
  discount?: number;
  delivery_time?: {
    days?: number;
    formatted?: string;
  };
  delivery_range?: {
    min?: number;
    max?: number;
  };
  custom_delivery_time?: string;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const logCheckoutEvent = async (
  action: string,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  diff: Record<string, any>,
  options?: { actorId?: string | null; entityId?: string | null }
) => {
  try {
    await supabase.from('audit_logs').insert({
      actor: options?.actorId ?? null,
      action,
      entity: 'checkout',
      entity_id: options?.entityId ?? null,
      diff,
    });
  } catch (error) {
    console.error('Failed to log checkout event', error);
  }
};

const formatDeliveryLabel = (option: ShippingOption) => {
  if (option.delivery_time?.formatted) return option.delivery_time.formatted;
  if (option.custom_delivery_time) return option.custom_delivery_time;
  if (option.delivery_time?.days) return `Entrega em até ${option.delivery_time.days} dia(s)`;
  if (option.delivery_range?.max) return `Entrega estimada em ${option.delivery_range.max} dia(s)`;
  return null;
};

const Checkout = () => {
  const { items, totalPrice, clearCart, discount, couponCode, hasFreeShipping } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [cep, setCep] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cardNumber: "",
    cardName: "",
    cardCvv: "",
    cardExpiry: "",
  });

  const ensureCustomerRecord = async (
    userId: string,
    data: { name: string; email: string; phone: string; cpf: string }
  ) => {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingCustomer?.id) {
      return existingCustomer.id;
    }

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        document: data.cpf,
      })
      .select()
      .single();

    if (error) throw error;
    return newCustomer?.id ?? null;
  };

  const handleCepChange = async (value: string) => {
    const sanitized = value.replace(/\D/g, "");
    setCep(sanitized);

    if (sanitized.length < 8) {
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setShippingCost(0);
      setShippingError(null);
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-shipping', {
        body: {
          cep: sanitized,
          items: items.map(item => ({
            id: item.id,
            width: 11,
            height: 2,
            length: 16,
            weight: 0.3,
            price: item.price,
            quantity: item.quantity,
          }))
        }
      });

      if (error) {
        throw new Error(error.message || 'Não foi possível calcular o frete');
      }

      if (data?.error) {
        const details = Array.isArray(data.details) ? data.details.join('; ') : data.details;
        throw new Error(typeof data.error === 'string' ? `${data.error}${details ? `: ${details}` : ''}` : 'Não foi possível calcular o frete');
      }

      const options = (data?.options || []) as ShippingOption[];
      if (options.length === 0) {
        setShippingOptions([]);
        setSelectedShippingOption(null);
        setShippingCost(0);
        setShippingError("Nenhuma opção de frete disponível para o CEP informado.");
        return;
      }

      setShippingOptions(options);
      const preferredOption = options.reduce((prev, curr) =>
        prev.price < curr.price ? prev : curr
      );
      setSelectedShippingOption(preferredOption);
      setShippingCost(preferredOption.price);

      await logCheckoutEvent('shipping_options_loaded', {
        cep: sanitized,
        options: options.map(option => ({
          id: option.id,
          name: option.name,
          company: option.company?.name,
          price: option.price,
        })),
      });
    } catch (error) {
      console.error('Error calculating shipping:', error);
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setShippingCost(0);
      setShippingError(
        error instanceof Error
          ? error.message
          : "Não foi possível calcular o frete. Tente novamente em instantes."
      );
      await logCheckoutEvent('shipping_calculation_error', {
        cep: sanitized,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleShippingSelection = async (optionId: string) => {
    const option = shippingOptions.find((item) => item.id === optionId) || null;
    setSelectedShippingOption(option);
    if (option) {
      setShippingCost(option.price);
      await logCheckoutEvent('shipping_option_selected', {
        shipping_option_id: option.id,
        price: option.price,
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const actualShippingCost = hasFreeShipping ? 0 : shippingCost;
  const finalTotal = totalPrice + actualShippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let currentActorId: string | null = null;

    try {
      const validatedData = checkoutSchema.parse({
        ...formData,
        cep,
        paymentMethod,
      });

      if (!selectedShippingOption) {
        toast({
          title: "Selecione o frete",
          description: "Escolha uma opção de entrega para continuar.",
          variant: "destructive",
        });
        await logCheckoutEvent('checkout_missing_shipping_option', {
          cep,
          paymentMethod,
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) {
        toast({
          title: "Faça login",
          description: "Entre na sua conta para finalizar o pedido.",
          variant: "destructive",
        });
        await logCheckoutEvent('checkout_missing_user', {
          email: validatedData.email,
        });
        return;
      }

      currentActorId = user.id;

      await logCheckoutEvent('checkout_submit_started', {
        items: items.length,
        paymentMethod,
        subtotal: totalPrice,
      }, { actorId: currentActorId });

      const shippingAddress = {
        name: validatedData.name,
        phone: validatedData.phone,
        zipcode: validatedData.cep,
        street: validatedData.street,
        number: validatedData.number,
        complement: validatedData.complement || null,
        district: validatedData.neighborhood,
        city: validatedData.city,
        state: validatedData.state,
        country: 'BR' as const,
      };

      const customerId = await ensureCustomerRecord(user.id, {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        cpf: validatedData.cpf,
      });

      const shippingOptionLabel = [
        selectedShippingOption.company?.name,
        selectedShippingOption.name,
      ].filter(Boolean).join(' - ');

      const actualShipping = hasFreeShipping ? 0 : selectedShippingOption.price;
      const shippingCents = Math.round(actualShipping * 100);
      const discountCents = Math.round(discount * 100);
      const subtotalCents = Math.round(subtotal * 100);
      const totalCents = subtotalCents - discountCents + shippingCents;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_id: customerId,
          email: validatedData.email,
          total: totalCents / 100,
          shipping_cents: shippingCents,
          subtotal_cents: subtotalCents,
          discount_cents: discountCents,
          coupon_code: couponCode,
          total_cents: totalCents,
          status: 'pending',
          payment_status: 'pending',
          payment_method: validatedData.paymentMethod === 'credit' ? 'credit_card' : 'pix',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      await logCheckoutEvent('checkout_order_created', {
        orderId: orderData.id,
        shipping_option_id: selectedShippingOption.id,
      }, { actorId: currentActorId, entityId: orderData.id });

      const { error: orderAddressError } = await supabase
        .from('order_addresses')
        .insert({
          ...shippingAddress,
          order_id: orderData.id,
          type: 'shipping',
        });

      if (orderAddressError) throw orderAddressError;

      if (customerId) {
        const { data: existingAddress } = await supabase
          .from('addresses')
          .select('id')
          .eq('customer_id', customerId)
          .eq('zipcode', shippingAddress.zipcode)
          .eq('street', shippingAddress.street)
          .eq('number', shippingAddress.number)
          .maybeSingle();

        if (!existingAddress) {
          const { error: addressError } = await supabase
            .from('addresses')
            .insert({
              customer_id: customerId,
              label: 'Checkout',
              ...shippingAddress,
            });

          if (addressError) throw addressError;
        }
      }

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        name_snapshot: item.name,
        size_snapshot: item.selectedSize,
        qty: item.quantity,
        unit_price_cents: Math.round(item.price * 100),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await logCheckoutEvent('checkout_items_persisted', {
        orderId: orderData.id,
        items: orderItems.length,
      }, { actorId: currentActorId, entityId: orderData.id });

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-mercado-pago-payment',
        {
          body: {
            orderId: orderData.id,
            items: items.map(item => ({
              title: item.name,
              quantity: item.quantity,
              unit_price: item.price,
            })),
            payer: {
              name: validatedData.name,
              email: validatedData.email,
            },
            shippingAddress,
            shippingOption: {
              id: selectedShippingOption.id,
              label: shippingOptionLabel,
              price: selectedShippingOption.price,
            },
          }
        }
      );

      if (paymentError) throw paymentError;

      await logCheckoutEvent('checkout_payment_created', {
        orderId: orderData.id,
        preferenceId: paymentData?.preference_id,
      }, { actorId: currentActorId, entityId: orderData.id });

      if (paymentData?.init_point) {
        clearCart();
        window.location.href = paymentData.init_point;
      } else {
        throw new Error('Erro ao criar pagamento');
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Erro ao finalizar pedido:', error);
        toast({
          title: "Erro ao finalizar pedido",
          description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
          variant: "destructive",
        });
      }

      await logCheckoutEvent('checkout_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      }, { actorId: currentActorId });
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-accent/5">
      <Navbar />
      <div className="border-b bg-background/80">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {user ? (
            <span>
              Finalizando compra como <span className="font-medium text-foreground">{user.email}</span>
            </span>
          ) : (
            <span>
              Já tem conta? <Link to="/login" className="text-primary font-medium">Entre para salvar seus dados</Link>
            </span>
          )}
          {!user && (
            <span className="text-xs sm:text-sm">Você também pode continuar como convidado.</span>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-semibold mb-8">Finalizar Compra</h1>
        
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-serif font-semibold mb-4">Dados Pessoais</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone"
                    placeholder="DDD + número (10-11 dígitos)"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "")})}
                    maxLength={11}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf"
                    placeholder="Apenas números"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, "")})}
                    maxLength={11}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-serif font-semibold mb-4">Endereço de Entrega</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={8}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input 
                      id="street" 
                      value={formData.street}
                      onChange={(e) => setFormData({...formData, street: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input 
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input 
                      id="complement"
                      value={formData.complement}
                      onChange={(e) => setFormData({...formData, complement: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input 
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                      maxLength={2}
                      required 
                    />
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Opções de Entrega</p>
                      <p className="text-sm text-muted-foreground">Informe o CEP para consultar fretes disponíveis</p>
                    </div>
                  </div>

                  {isCalculatingShipping && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculando frete...
                    </div>
                  )}

                  {shippingError && (
                    <p className="text-sm text-destructive">{shippingError}</p>
                  )}

                  {!isCalculatingShipping && shippingOptions.length > 0 && (
                    <RadioGroup
                      value={selectedShippingOption?.id || shippingOptions[0]?.id}
                      onValueChange={(value) => { void handleShippingSelection(value); }}
                      className="space-y-3"
                    >
                      {shippingOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-3 border rounded-lg p-4">
                          <RadioGroupItem value={option.id} id={`shipping-${option.id}`} />
                          <Label htmlFor={`shipping-${option.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-medium">{option.name}</p>
                                <p className="text-sm text-muted-foreground">{option.company?.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(option.price)}</p>
                                {formatDeliveryLabel(option) && (
                                  <p className="text-xs text-muted-foreground">{formatDeliveryLabel(option)}</p>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {!isCalculatingShipping && shippingOptions.length === 0 && cep.length === 8 && !shippingError && (
                    <p className="text-sm text-muted-foreground">Aguarde enquanto buscamos as opções de frete...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-serif font-semibold mb-4">Forma de Pagamento</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">Até 3x sem juros ou até 6x com juros</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === "credit" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="0000 0000 0000 0000"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, "")})}
                      maxLength={16}
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input 
                        id="cardName"
                        value={formData.cardName}
                        onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input 
                        id="cardCvv"
                        value={formData.cardCvv}
                        onChange={(e) => setFormData({...formData, cardCvv: e.target.value.replace(/\D/g, "")})}
                        maxLength={4}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Validade (MM/AA)</Label>
                      <Input 
                        id="cardExpiry" 
                        placeholder="MM/AA"
                        value={formData.cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 2) {
                            val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          }
                          setFormData({...formData, cardExpiry: val});
                        }}
                        maxLength={5}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="installments">Parcelas</Label>
                      <select id="installments" className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>1x de R$ {finalTotal.toFixed(2)}</option>
                        <option>2x de R$ {(finalTotal / 2).toFixed(2)}</option>
                        <option>3x de R$ {(finalTotal / 3).toFixed(2)} sem juros</option>
                        <option>4x de R$ {(finalTotal / 4 * 1.02).toFixed(2)}</option>
                        <option>5x de R$ {(finalTotal / 5 * 1.03).toFixed(2)}</option>
                        <option>6x de R$ {(finalTotal / 6 * 1.04).toFixed(2)}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-sm border sticky top-24">
              <h2 className="text-xl font-serif font-semibold mb-4">Resumo</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} ({item.quantity}x)
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Desconto {couponCode && `(${couponCode})`}</span>
                    <span>- {formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  {hasFreeShipping ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">GRÁTIS</span>
                  ) : (
                    <span>{shippingCost > 0 ? formatCurrency(shippingCost) : 'Calcular'}</span>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full">
                Finalizar Pedido
              </Button>
              
              <div className="mt-6 space-y-2 text-xs text-center text-muted-foreground">
                <p>🔒 Ambiente 100% seguro</p>
                <p>✓ Compra protegida</p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
