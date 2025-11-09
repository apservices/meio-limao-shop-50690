import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/data/products";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  className?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  isNew,
  className,
}: ProductCardProps) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const product: Product = {
    id, name, price, originalPrice, image, category, isNew,
    description: "", sizes: [], colors: [], rating: 5, reviews: 0
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
          src={image}
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
              toggleItem(product);
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
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {category}
        </p>
        <Link to={`/produto/${id}`}>
          <h3 className="font-medium text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            R$ {price.toFixed(2).replace(".", ",")}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {originalPrice.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ou 3x de R$ {(price / 3).toFixed(2).replace(".", ",")} sem juros
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
