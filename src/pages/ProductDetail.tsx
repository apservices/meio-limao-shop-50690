import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReviewsSection from "@/components/ReviewsSection";
import ProductSchema from "@/components/ProductSchema";
import ShippingCalculator from "@/components/ShippingCalculator";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import ProductGallery from "@/components/ProductGallery";
import ProductDetailInfo from "@/components/ProductDetailInfo";
import CompleteTheLook from "@/components/CompleteTheLook";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import SocialShareButtons from "@/components/SocialShareButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Leaf, Droplets, Wind } from "lucide-react";
import { toast } from "sonner";
import { useProductQuery } from "@/hooks/useProductsQuery";
import { getPrimaryImageUrl, toProduct } from "@/types/product";
import type { ColorImage } from "@/types/colorImage";

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
  const colorImages: ColorImage[] = data?.colorImages ?? [];
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { trackProductView, trackAddToCart } = useAnalytics();

  // Track product view
  useEffect(() => {
    if (product) {
      trackProductView(product.id, product.name);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="w-full aspect-[3/4] rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-48" />
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
          <h1 className="font-serif text-3xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-muted-foreground mb-8">O produto que você está procurando não existe ou foi removido.</p>
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
  const productImages = productRecord.product_images?.map(img => img.image_url) ?? [];
  const galleryImages = productImages.length > 0 ? productImages : [primaryImage];

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
    trackAddToCart(product.id, 1, product.price);
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
      <SEOHead 
        title={`${product.name} - Meio Limão`}
        description={product.description ?? `Compre ${product.name} na Meio Limão. Moda feminina tropical chic com qualidade premium.`}
        image={primaryImage}
      />
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-20 mt-8">
            {/* Product Gallery */}
            <ProductGallery 
              images={galleryImages} 
              productName={product.name}
              colorImages={colorImages}
              selectedColor={selectedColor}
            />

            {/* Product Info */}
            <div className="space-y-6">
              <ProductDetailInfo
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                averageRating={averageRating}
                totalReviews={totalReviews}
              />
              
              {/* Social Share */}
              <div className="pt-4 border-t">
                <SocialShareButtons
                  productName={product.name}
                  productPrice={product.price}
                  productUrl={`https://meiolimao.shop/produto/${product.id}`}
                  productImage={getPrimaryImageUrl(productRecord)}
                />
              </div>
            </div>
          </div>

          <Separator className="my-16" />

          {/* Shipping Calculator */}
          <div className="max-w-2xl mx-auto mb-20">
            <ShippingCalculator />
          </div>

          <Separator className="my-16" />

          {/* Product Details & Reviews */}
          <div className="mb-20">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
                <TabsTrigger value="details" className="text-base">Detalhes do Produto</TabsTrigger>
                <TabsTrigger value="reviews" className="text-base">Avaliações ({totalReviews})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border">
                <div className="max-w-4xl">
                  <div className="space-y-8">
                    {/* About */}
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-4">Sobre o Produto</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {product.description ?? "Peça confeccionada com tecidos nobres e acabamento impecável. Perfeita para compor looks tropicais elegantes e sofisticados."}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    {/* Composition */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Leaf className="h-6 w-6 text-primary" />
                        <h4 className="font-serif text-xl font-semibold">Composição</h4>
                      </div>
                      <p className="text-muted-foreground">
                        100% Algodão natural de alta qualidade<br />
                        Tecido leve, respirável e confortável
                      </p>
                    </div>
                    
                    <Separator />
                    
                    {/* Care Instructions */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Droplets className="h-6 w-6 text-primary" />
                        <h4 className="font-serif text-xl font-semibold">Cuidados com a Peça</h4>
                      </div>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Lavar à mão ou à máquina em água fria (até 30°C)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Não usar alvejante ou produtos químicos agressivos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Secar à sombra em local arejado</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Passar em temperatura baixa se necessário</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    {/* Model Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Wind className="h-6 w-6 text-primary" />
                        <h4 className="font-serif text-xl font-semibold">Medidas da Modelo</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                        <div>
                          <p className="font-semibold text-foreground mb-1">Altura</p>
                          <p>1,75m</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1">Tamanho</p>
                          <p>Veste P</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border">
                <ReviewsSection
                  reviews={reviews}
                  averageRating={averageRating}
                  totalReviews={totalReviews}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Complete the Look */}
        <CompleteTheLook 
          currentProductId={product.id} 
          category={product.categoryId} 
        />

        {/* Personalized Recommendations */}
        <div className="container mx-auto px-4 py-20">
          {relatedProducts.length > 0 ? (
            <section>
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Você Também Pode Gostar</h2>
                <p className="text-muted-foreground">Selecionamos especialmente para você</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </section>
          ) : user && (
            <ProductRecommendations 
              userId={user.id}
              currentProductId={id}
              limit={8}
            />
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
