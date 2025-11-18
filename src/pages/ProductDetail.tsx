import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReviewsSection from "@/components/ReviewsSection";
import ProductImageZoom from "@/components/ProductImageZoom";
import ProductSchema from "@/components/ProductSchema";
import ShippingCalculator from "@/components/ShippingCalculator";
import SizeGuide from "@/components/SizeGuide";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Star, Heart, ShoppingBag, Truck, RefreshCw, MessageCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { useProductQuery } from "@/hooks/useProductsQuery";
import { getPrimaryImageUrl, toProduct } from "@/types/product";

const ProductDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useProductQuery(id);
  const productRecord = data?.product;
  const product = useMemo(() => (productRecord ? toProduct(productRecord) : undefined), [productRecord]);
  const relatedProducts = useMemo(
    () => (data?.related ?? []).map(toProduct),
    [data?.related]
  );
  const reviews = data?.reviews ?? [];
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="w-full h-[500px] rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product || !productRecord) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/shop">
            <Button>Voltar para a loja</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = product.rating ??
    (reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0);
  const totalReviews = product.reviews ?? reviews.length;
  const availableSizes = product.sizes ?? [];
  const availableColors = product.colors ?? [];
  const primaryImage = product.image ?? getPrimaryImageUrl(productRecord) ?? "/placeholder.svg?height=600&width=400";

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Por favor, selecione um tamanho");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Por favor, selecione uma cor");
      return;
    }
    addItem(product, selectedSize, selectedColor, 1);
    toast.success("Produto adicionado ao carrinho!");
  };

  const handleToggleWishlist = () => {
    toggleItem(product);
    if (isInWishlist(product.id)) {
      toast.success("Removido dos favoritos");
    } else {
      toast.success("Adicionado aos favoritos!");
    }
  };

  return (
    <div className="min-h-screen">
      <ProductSchema product={product} />
      <Navbar />
      
      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: "Loja", path: "/shop" },
              { label: product.category ?? "Moda", path: `/shop?category=${product.category ?? ""}` },
              { label: product.name, path: `/produto/${product.id}` },
            ]}
          />

          {/* Product Content */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Product Image */}
            <div className="space-y-4">
              <ProductImageZoom src={primaryImage} alt={product.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  {product.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(averageRating)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} ({totalReviews} avaliações)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  ou até 6x de R$ {(product.price / 6).toFixed(2).replace(".", ",")} sem juros
                </p>
              </div>

              {/* Description */}
              <p className="text-foreground leading-relaxed">
                {product.description ?? "Descrição indisponível no momento."}
              </p>

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">Tamanho</Label>
                    <SizeGuide />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 w-12 rounded-lg border-2 font-medium transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
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
                  <Label className="text-sm font-semibold mb-3 block">Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          selectedColor === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isInWishlist(product.id) ? "fill-primary" : ""}`} />
                  {isInWishlist(product.id) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                </Button>
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <a
                    href="https://wa.me/5511999999999?text=Olá! Tenho dúvidas sobre este produto"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Dúvidas? Fale conosco
                  </a>
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-6 border-t">
                <ShippingCalculator />
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary" />
                  <span>Frete grátis para compras acima de R$ 199</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <span>Troca grátis em até 30 dias</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Package className="h-5 w-5 text-primary" />
                  <span>Envio em até 2 dias úteis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details & Reviews */}
          <div className="mb-16">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="details">Detalhes do Produto</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações ({totalReviews})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-serif font-semibold mb-4">Sobre o Produto</h3>
                  <p className="text-muted-foreground mb-4">
                    {product.description ?? "Descrição indisponível no momento."}
                  </p>
                  
                  <h4 className="font-semibold mb-2">Composição</h4>
                  <p className="text-muted-foreground mb-4">100% Algodão natural</p>
                  
                  <h4 className="font-semibold mb-2">Cuidados</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Lavar à mão ou à máquina em água fria</li>
                    <li>Não usar alvejante</li>
                    <li>Secar à sombra</li>
                    <li>Passar em temperatura baixa se necessário</li>
                  </ul>
                  
                  <h4 className="font-semibold mb-2 mt-4">Medidas da Modelo</h4>
                  <p className="text-muted-foreground">Altura: 1,75m | Veste: P</p>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border">
                <ReviewsSection
                  reviews={reviews}
                  averageRating={averageRating}
                  totalReviews={totalReviews}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Você também pode gostar</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetail;
