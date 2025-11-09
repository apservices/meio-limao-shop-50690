import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

interface ProductImageZoomProps {
  src: string;
  alt: string;
}

const ProductImageZoom = ({ src, alt }: ProductImageZoomProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <>
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted cursor-zoom-in group"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500"
          style={{
            transform: isHovering ? `scale(1.5)` : 'scale(1)',
            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-full p-3">
            <ZoomIn className="h-6 w-6" />
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-background">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductImageZoom;
