import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const {
    id,
    name,
    price,
    originalPrice,
    image,
    category,
    isNew,
    description,
    sizes,
    colors,
    rating,
    reviews,
  } = product;
  const { toggleItem, isInWishlist } = useWishlist();
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const coverImage = image ?? "/placeholder.svg?height=600&width=400";
  const wishlistProduct: Product = {
    id,
    name,
    price,
    originalPrice,
    image: coverImage,
    category,
    isNew,
    description,
    sizes,
    colors,
    rating,
    reviews,
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-[var(--shadow-hover)]",
        className
      )}
    >
      {/* Image Container */}
      <Link to={`/produto/${id}`} className="relative block aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={coverImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground">Novo</Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive">-{discount}%</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              toggleItem(wishlistProduct);
            }}
          >
            <Heart className={cn("h-4 w-4", isInWishlist(id) && "fill-primary")} />
          </Button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Button className="w-full rounded-none rounded-t-xl" size="lg">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 md:p-4 space-y-1.5">
        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-light">
          {category ?? "Moda"}
        </p>
        <Link to={`/produto/${id}`}>
          <h3 className="text-sm md:text-base font-normal text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base md:text-lg font-semibold text-foreground">
            R$ {price.toFixed(2).replace(".", ",")}
          </span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through font-light">
              R$ {originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground font-light">
          ou 3x de R$ {(price / 3).toFixed(2).replace(".", ",")}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
