import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useColorImagesCache } from "@/hooks/useColorImagesCache";
import type { Product } from "@/types/product";
import type { ColorImage } from "@/types/colorImage";

interface ProductCardProps {
  product: Product;
  className?: string;
}

// Helper para converter nome de cor em hex
const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    "amarelo": "#FFD700",
    "amarelo limão": "#DFFF00",
    "verde": "#228B22",
    "verde menta": "#98FF98",
    "rosa": "#FF69B4",
    "rosa claro": "#FFB6C1",
    "azul": "#4169E1",
    "azul marinho": "#000080",
    "branco": "#FFFFFF",
    "preto": "#000000",
    "bege": "#F5F5DC",
    "marrom": "#8B4513",
    "laranja": "#FF8C00",
    "vermelho": "#DC143C",
    "roxo": "#8B008B",
    "lilás": "#C8A2C8",
    "cinza": "#808080",
    "coral": "#FF7F50",
    "turquesa": "#40E0D0",
    "dourado": "#FFD700",
    "prata": "#C0C0C0",
  };

  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || "#CBD5E1";
};

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
  const { getColorImages, getCached } = useColorImagesCache();
  const [colorImages, setColorImages] = useState<ColorImage[]>([]);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const defaultImage = image ?? "/placeholder.svg?height=600&width=400";

  // Carregar imagens por cor (usa cache global)
  const loadColorImages = async () => {
    if (loaded) return;
    
    // Verificar cache primeiro (síncrono)
    const cached = getCached(id);
    if (cached) {
      setColorImages(cached);
      setLoaded(true);
      return;
    }

    // Buscar do banco (com cache)
    const images = await getColorImages(id);
    setColorImages(images);
    setLoaded(true);
  };

  // Determinar a imagem a exibir
  const getDisplayImage = () => {
    if (hoveredColor && colorImages.length > 0) {
      const colorImage = colorImages.find(
        img => img.color_name.toLowerCase() === hoveredColor.toLowerCase() && img.is_primary
      ) || colorImages.find(
        img => img.color_name.toLowerCase() === hoveredColor.toLowerCase()
      );
      
      if (colorImage) {
        return colorImage.image_url;
      }
    }
    return defaultImage;
  };

  const coverImage = getDisplayImage();
  
  const wishlistProduct: Product = {
    id,
    name,
    price,
    originalPrice,
    image: defaultImage,
    category,
    isNew,
    description,
    sizes,
    colors,
    rating,
    reviews,
  };

  const hasColors = colors && colors.length > 0;

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
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
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

        {/* Hovered Color indicator */}
        {hoveredColor && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium transition-opacity duration-200">
            {hoveredColor}
          </div>
        )}

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

        {/* Color Swatches */}
        {hasColors && (
          <div 
            className="flex items-center gap-1.5 py-1"
            onMouseEnter={loadColorImages}
          >
            {colors.slice(0, 5).map((color) => (
              <button
                key={color}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-125",
                  hoveredColor === color 
                    ? "border-primary ring-2 ring-primary/30 scale-125" 
                    : "border-border/50 hover:border-primary/50"
                )}
                style={{ backgroundColor: getColorHex(color) }}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/produto/${id}?cor=${encodeURIComponent(color)}`;
                }}
                title={color}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{colors.length - 5}
              </span>
            )}
          </div>
        )}

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
          até 6x de R$ {(price / 6).toFixed(2).replace(".", ",")} sem juros
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
