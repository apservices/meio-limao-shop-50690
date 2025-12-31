import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ColorImage } from "@/types/colorImage";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  colorImages?: ColorImage[];
  selectedColor?: string;
}

const ProductGallery = ({ 
  images, 
  productName, 
  colorImages = [],
  selectedColor 
}: ProductGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Determinar quais imagens exibir baseado na cor selecionada
  const displayImages = useMemo(() => {
    if (selectedColor && colorImages.length > 0) {
      const colorSpecificImages = colorImages
        .filter(img => img.color_name.toLowerCase() === selectedColor.toLowerCase())
        .sort((a, b) => {
          // Imagem primária primeiro
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        })
        .map(img => img.image_url);
      
      if (colorSpecificImages.length > 0) {
        return colorSpecificImages;
      }
    }
    
    // Fallback para imagens gerais do produto
    return images.length > 0 ? images : ["/placeholder.svg?height=800&width=600"];
  }, [images, colorImages, selectedColor]);

  // Resetar índice quando a cor muda
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedColor]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 w-full">
      {/* Main Image */}
      <div className="sticky top-4 relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted group">
        <img
          src={displayImages[currentIndex]}
          alt={`${productName}${selectedColor ? ` - ${selectedColor}` : ''} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover select-none transition-opacity duration-300"
          loading="eager"
        />
        
        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Color indicator */}
        {selectedColor && colorImages.some(img => img.color_name.toLowerCase() === selectedColor.toLowerCase()) && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg">
            {selectedColor}
          </div>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300",
                currentIndex === index
                  ? "border-primary shadow-lg scale-105"
                  : "border-transparent hover:border-primary/50 hover:scale-105"
              )}
            >
              <img
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
