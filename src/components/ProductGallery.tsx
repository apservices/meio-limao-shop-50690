import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const mainImages = images.length > 0 ? images : ["/placeholder.svg?height=800&width=600"];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mainImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mainImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 w-full">
      {/* Main Image */}
      <div className="sticky top-4 relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted group">
        <img
          src={mainImages[currentIndex]}
          alt={`${productName} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover select-none"
          loading="eager"
        />
        
        {/* Navigation Arrows */}
        {mainImages.length > 1 && (
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

        {/* Image Counter */}
        {mainImages.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
            {currentIndex + 1} / {mainImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {mainImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {mainImages.map((image, index) => (
            <button
              key={index}
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
