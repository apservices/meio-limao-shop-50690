import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { CreditCard, Smartphone } from "lucide-react";
import { checkoutSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [cep, setCep] = useState("");
  const [shippingCost, setShippingCost] = useState(15.90);
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

  const handleCepChange = async (value: string) => {
    setCep(value);
    
    if (value.length === 8) {
      try {
        const { data } = await supabase.functions.invoke('calculate-shipping', {
          body: { 
            cep: value,
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

        if (data?.options && data.options.length > 0) {
          // Usa a opção mais barata
          const cheapest = data.options.reduce((prev: any, curr: any) => 
            prev.price < curr.price ? prev : curr
          );
          setShippingCost(cheapest.price);
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
        setShippingCost(15.90); // fallback
      }
    }
  };

  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar dados com Zod
      const validatedData = checkoutSchema.parse({
        ...formData,
        cep,
        paymentMethod,
      });

      // Removed console.log to prevent sensitive data exposure

      // Criar order no banco
      const { data: { user } } = await supabase.auth.getUser();
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          email: validatedData.email,
          total: finalTotal,
          shipping_cents: Math.round(shippingCost * 100),
          subtotal_cents: Math.round(totalPrice * 100),
          total_cents: Math.round(finalTotal * 100),
          status: 'pending',
          payment_status: 'pending',
          payment_method: validatedData.paymentMethod === 'credit' ? 'credit_card' : 'pix',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar order_items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        name_snapshot: item.name,
        size_snapshot: item.selectedSize,
        qty: item.quantity,
        unit_price_cents: Math.round(item.price * 100),
        subtotal_cents: Math.round(item.price * item.quantity * 100),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Se for PIX ou cartão, criar pagamento com Mercado Pago
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
          }
        }
      );

      if (paymentError) throw paymentError;

      // Redirecionar para Mercado Pago
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
                    <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span>R$ {shippingCost.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
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
