import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";
import { SlidersHorizontal, X, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const Shop = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([500]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    if (product.price > priceRange[0]) {
      return false;
    }
    if (showNewOnly && !product.isNew) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesDescription = product.description.toLowerCase().includes(query);
      const matchesCategory = product.category.toLowerCase().includes(query);
      if (!matchesName && !matchesDescription && !matchesCategory) {
        return false;
      }
    }
    return true;
  });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-4">Categorias</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category]);
                  } else {
                    setSelectedCategories(selectedCategories.filter(c => c !== category));
                  }
                }}
              />
              <Label htmlFor={category} className="cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4">
          Preço até R$ {priceRange[0]}
        </h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          min={0}
          step={10}
          className="mb-2"
        />
      </div>

      {/* New Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="newOnly"
          checked={showNewOnly}
          onCheckedChange={(checked) => setShowNewOnly(checked as boolean)}
        />
        <Label htmlFor="newOnly" className="cursor-pointer">
          Apenas novidades
        </Label>
      </div>

      {/* Clear Filters */}
      {(selectedCategories.length > 0 || showNewOnly || priceRange[0] < 500 || searchQuery) && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setSelectedCategories([]);
            setShowNewOnly(false);
            setPriceRange([500]);
            setSearchQuery("");
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Loja</h1>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <p className="text-muted-foreground mt-4">
              {filteredProducts.length} produtos encontrados
            </p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-2xl p-6 border">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <SlidersHorizontal className="mr-2 h-5 w-5" />
                  Filtros
                </h2>
                <FilterContent />
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg">
                    <SlidersHorizontal className="mr-2 h-5 w-5" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto h-[calc(80vh-100px)]">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground mb-4">
                    Nenhum produto encontrado
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories([]);
                      setShowNewOnly(false);
                      setPriceRange([500]);
                      setSearchQuery("");
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default Shop;
