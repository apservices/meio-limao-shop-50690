import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Star, Heart, ShoppingBag, Truck, RefreshCw, Shield, Package } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductDetailInfoProps {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  isInWishlist: boolean;
  averageRating: number;
  totalReviews: number;
}

const ProductDetailInfo = ({
  product,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  averageRating,
  totalReviews
}: ProductDetailInfoProps) => {
  const availableSizes = product.sizes ?? [];
  const availableColors = product.colors ?? [];
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Category & Title */}
      <div>
        <p className="text-primary font-medium uppercase tracking-wider mb-2 text-sm">
          {product.category ?? "Moda"}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
          {product.name}
        </h1>
        
        {/* Rating & Reviews */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.round(averageRating)
                    ? "fill-primary text-primary"
                    : "text-muted"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {totalReviews > 0 ? `${totalReviews} avaliações` : "Sem avaliações"}
          </span>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground">Novo</Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive">-{discount}%</Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl font-bold text-foreground">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.originalPrice && (
            <span className="text-xl text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          ou <span className="font-semibold text-foreground">3x de R$ {(product.price / 3).toFixed(2).replace(".", ",")}</span> sem juros
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          ou até <span className="font-semibold">6x de R$ {(product.price / 6).toFixed(2).replace(".", ",")}</span> com juros
        </p>
      </div>

      <Separator />

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">Tamanho</Label>
            <button className="text-sm text-primary hover:underline">
              Guia de medidas
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={cn(
                  "px-6 py-3 rounded-xl border-2 font-medium transition-all duration-300",
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                    : "border-border hover:border-primary/50 hover:scale-105"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div>
          <Label className="text-base font-semibold mb-4 block">Cor</Label>
          <div className="flex gap-3 flex-wrap">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={cn(
                  "px-6 py-3 rounded-xl border-2 font-medium transition-all duration-300 capitalize",
                  selectedColor === color
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                    : "border-border hover:border-primary/50 hover:scale-105"
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          onClick={onAddToCart}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Adicionar ao Carrinho
        </Button>
        
        <Button 
          size="lg" 
          variant="outline" 
          className="w-full h-14 text-lg group"
          onClick={onToggleWishlist}
        >
          <Heart className={cn("mr-2 h-5 w-5", isInWishlist && "fill-primary")} />
          {isInWishlist ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 pt-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-secondary/30">
          <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Frete Rápido</p>
            <p className="text-xs text-muted-foreground">Entrega em todo Brasil</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-secondary/30">
          <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Troca Fácil</p>
            <p className="text-xs text-muted-foreground">30 dias para trocar</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-secondary/30">
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Compra Segura</p>
            <p className="text-xs text-muted-foreground">Dados protegidos</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-secondary/30">
          <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Qualidade Premium</p>
            <p className="text-xs text-muted-foreground">Acabamento impecável</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailInfo;
