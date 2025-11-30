import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { toProduct } from "@/types/product";

const DEFAULT_MAX_PRICE = 500;
const ITEMS_PER_PAGE = 12;

const Shop = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([DEFAULT_MAX_PRICE]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useProductsQuery();

  const productsFromDb = useMemo(
    () => (data?.products ?? []).map(toProduct),
    [data?.products]
  );

  const maxPrice = productsFromDb.reduce((max, product) => Math.max(max, product.price), 0);
  const priceSliderMax = Math.max(
    DEFAULT_MAX_PRICE,
    Math.ceil((maxPrice || DEFAULT_MAX_PRICE) / 50) * 50
  );

  useEffect(() => {
    if (priceRange[0] === DEFAULT_MAX_PRICE) {
      setPriceRange([priceSliderMax]);
    }
  }, [priceSliderMax]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceRange, showNewOnly, searchQuery]);

  const categoryOptions = useMemo(() => {
    if (data?.categories?.length) return data.categories;
    const map = new Map<string, { id: string; name: string }>();
    productsFromDb.forEach((product) => {
      if (!product.category && !product.categoryId) return;
      const id = product.categoryId ?? product.category ?? "categoria";
      map.set(id, { id, name: product.category ?? "Moda" });
    });
    return Array.from(map.values());
  }, [data?.categories, productsFromDb]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return productsFromDb.filter((product) => {
      const categoryId = product.categoryId ?? product.category ?? "";
      if (selectedCategories.length && !selectedCategories.includes(categoryId)) {
        return false;
      }
      if (product.price > priceRange[0]) {
        return false;
      }
      if (showNewOnly && !product.isNew) {
        return false;
      }
      if (query) {
        const matches =
          product.name.toLowerCase().includes(query) ||
          (product.description ?? "").toLowerCase().includes(query) ||
          (product.category ?? "").toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [productsFromDb, selectedCategories, priceRange, showNewOnly, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPageClamped - 1) * ITEMS_PER_PAGE,
    currentPageClamped * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSelectedCategories([]);
    setShowNewOnly(false);
    setPriceRange([priceSliderMax]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const showClearButton =
    selectedCategories.length > 0 ||
    showNewOnly ||
    priceRange[0] < priceSliderMax ||
    Boolean(searchQuery);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-4">Categorias</h3>
        <div className="space-y-3">
          {categoryOptions.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.id]);
                  } else {
                    setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                  }
                }}
              />
              <Label htmlFor={category.id} className="cursor-pointer">
                {category.name}
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
          max={priceSliderMax}
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
      {showClearButton && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
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
            <div className="lg:hidden fixed bottom-28 md:bottom-24 left-1/2 -translate-x-1/2 z-40">
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
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground mb-4">
                    Nenhum produto encontrado
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-8">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {paginatedProducts.length} de {filteredProducts.length} produtos
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPageClamped - 1))}
                          disabled={currentPageClamped === 1}
                        >
                          Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Página {currentPageClamped} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(Math.min(totalPages, currentPageClamped + 1))
                          }
                          disabled={currentPageClamped === totalPages}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
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
