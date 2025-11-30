import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Label } from "@/components/ui/label";

const Cart = () => {
  const cart = useCart();
  const { items, updateQuantity, removeItem, totalPrice } = cart;
  const applyCoupon = cart.applyCoupon || (async () => ({ success: false, message: 'Função não disponível' }));
  const removeCoupon = cart.removeCoupon || (() => {});
  const couponCode = cart.couponCode || null;
  const discount = cart.discount || 0;
  const hasFreeShipping = cart.hasFreeShipping || false;
  
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingEstimate = 15.90;
  const shippingCost = hasFreeShipping ? 0 : shippingEstimate;
  const finalTotal = totalPrice + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    const result = await applyCoupon(couponInput);
    setIsApplyingCoupon(false);

    if (result.success) {
      toast({
        title: "Cupom aplicado!",
        description: `Desconto de R$ ${result.discount?.toFixed(2).replace(".", ",")} aplicado`,
      });
      setCouponInput("");
    } else {
      toast({
        title: "Erro ao aplicar cupom",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do seu carrinho",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-serif font-semibold mb-4">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-8">
            Adicione produtos incríveis para começar suas compras
          </p>
          <Button size="lg" asChild>
            <Link to="/shop">Descobrir produtos</Link>
          </Button>
        </main>
        <MobileBottomNav />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-serif font-semibold mb-8">Meu Carrinho</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tamanho: {item.selectedSize} | Cor: {item.selectedColor}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ou 3x de R$ {(item.price * item.quantity / 3).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-sm border sticky top-24">
              <h2 className="text-xl font-serif font-semibold mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Desconto</span>
                    <span>- R$ {discount.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete estimado</span>
                  {hasFreeShipping ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">GRÁTIS</span>
                  ) : (
                    <span>R$ {shippingEstimate.toFixed(2).replace(".", ",")}</span>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou até 6x de R$ {(finalTotal / 6).toFixed(2).replace(".", ",")} com juros
                  </p>
                </div>
              </div>
              
              <Button size="lg" className="w-full mb-3" asChild>
                <Link to="/checkout">Finalizar Compra</Link>
              </Button>
              
              <Button variant="outline" size="lg" className="w-full mb-6" asChild>
                <Link to="/shop">Continuar Comprando</Link>
              </Button>

              {/* Coupon Section */}
              <div className="pt-6 border-t bg-accent/5 p-4 rounded-lg">
                <Label className="text-sm font-bold mb-3 block flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Cupom de Desconto
                </Label>
                {!couponCode ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o cupom"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      size="sm"
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Aplicar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {couponCode}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Cart;
