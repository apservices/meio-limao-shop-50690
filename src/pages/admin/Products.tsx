import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit, Sparkles, Copy, Palette } from "lucide-react";
import { ImageUploadWithAI } from "@/components/admin/ImageUploadWithAI";
import { ProductVariantsEditor, ProductVariant } from "@/components/admin/ProductVariantsEditor";
import { ColorImagesEditor, ColorImage } from "@/components/admin/ColorImagesEditor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id?: string;
  image_url?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  is_new: boolean;
  is_active: boolean;
  rating?: number;
  reviews_count?: number;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category_id: "",
    image_url: "",
    images: "",
    sizes: "",
    colors: "",
    stock: "0",
    is_new: false,
    is_active: true,
    // Novos campos
    sku_base: "",
    weight_grams: "300",
    dimensions: "",
    meta_title: "",
    meta_description: "",
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [colorImages, setColorImages] = useState<ColorImage[]>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar produtos", variant: "destructive" });
      return;
    }

    setProducts(data || []);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Calcular estoque total das variantes
    const totalStock = variants.length > 0 
      ? variants.reduce((sum, v) => sum + v.inventory_qty, 0)
      : parseInt(formData.stock);

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      images: formData.images ? formData.images.split(',').map(url => url.trim()).filter(url => url) : [],
      sizes: formData.sizes ? formData.sizes.split(',').map(size => size.trim()).filter(size => size) : [],
      colors: formData.colors ? formData.colors.split(',').map(color => color.trim()).filter(color => color) : [],
      stock: totalStock,
      is_new: formData.is_new,
      is_active: formData.is_active,
      rating: 0,
      reviews_count: 0,
    };

    let productId: string;
    let error;

    if (editingProduct) {
      productId = editingProduct.id;
      ({ error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id));
    } else {
      const { data, error: insertError } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();
      error = insertError;
      productId = data?.id;
    }

    if (error) {
      toast({ title: "Erro ao salvar produto", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Salvar variantes se houver
    if (variants.length > 0 && productId) {
      // Deletar variantes antigas se estiver editando
      if (editingProduct) {
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", productId);
      }

      // Inserir novas variantes
      const variantsToInsert = variants.map(v => ({
        product_id: productId,
        sku: v.sku,
        option1_label: v.option1_label,
        option1_value: v.option1_value,
        option2_label: v.option2_label,
        option2_value: v.option2_value,
        price_cents: v.price_cents,
        inventory_qty: v.inventory_qty,
        weight_grams: v.weight_grams,
        is_active: v.is_active,
      }));

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantsError) {
        console.error("Erro ao salvar variantes:", variantsError);
        toast({ title: "Produto salvo, mas erro nas variantes", variant: "destructive" });
      }
    }

    // Salvar imagens por cor
    if (colorImages.length > 0 && productId) {
      // Deletar imagens antigas se estiver editando
      if (editingProduct) {
        await supabase
          .from("product_color_images")
          .delete()
          .eq("product_id", productId);
      }

      // Inserir novas imagens
      const imagesToInsert = colorImages.map(img => ({
        product_id: productId,
        color_name: img.color_name,
        image_url: img.image_url,
        is_primary: img.is_primary,
        sort_order: img.sort_order,
      }));

      const { error: imagesError } = await supabase
        .from("product_color_images")
        .insert(imagesToInsert);

      if (imagesError) {
        console.error("Erro ao salvar imagens por cor:", imagesError);
        toast({ title: "Produto salvo, mas erro nas imagens por cor", variant: "destructive" });
      }
    }

    toast({ title: editingProduct ? "Produto atualizado!" : "Produto criado!" });
    setDialogOpen(false);
    resetForm();
    loadProducts();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir produto", variant: "destructive" });
    } else {
      toast({ title: "Produto excluído!" });
      loadProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      images: product.images?.join(', ') || "",
      sizes: product.sizes?.join(', ') || "",
      colors: product.colors?.join(', ') || "",
      stock: product.stock.toString(),
      is_new: product.is_new,
      is_active: product.is_active,
      sku_base: "",
      weight_grams: "300",
      dimensions: "",
      meta_title: "",
      meta_description: "",
    });
    loadVariants(product.id);
    loadColorImages(product.id);
    setDialogOpen(true);
  };

  const loadColorImages = async (productId: string) => {
    const { data } = await supabase
      .from("product_color_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");
    
    if (data) {
      setColorImages(data.map(img => ({
        id: img.id,
        product_id: img.product_id,
        color_name: img.color_name,
        image_url: img.image_url,
        is_primary: img.is_primary ?? false,
        sort_order: img.sort_order ?? 0,
      })));
    } else {
      setColorImages([]);
    }
  };

  const loadVariants = async (productId: string) => {
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId);
    
    if (data) {
      setVariants(data.map(v => ({
        id: v.id,
        sku: v.sku,
        option1_label: v.option1_label || "Tamanho",
        option1_value: v.option1_value || "",
        option2_label: v.option2_label || "Cor",
        option2_value: v.option2_value || "",
        price_cents: v.price_cents,
        inventory_qty: v.inventory_qty || 0,
        weight_grams: v.weight_grams || 300,
        is_active: v.is_active ?? true,
      })));
    } else {
      setVariants([]);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      original_price: "",
      category_id: "",
      image_url: "",
      images: "",
      sizes: "",
      colors: "",
      stock: "0",
      is_new: false,
      is_active: true,
      sku_base: "",
      weight_grams: "300",
      dimensions: "",
      meta_title: "",
      meta_description: "",
    });
    setVariants([]);
    setColorImages([]);
  };

  const handleImageAnalyzed = (data: {
    imageUrl: string;
    additionalImages?: string[];
    productData?: {
      name?: string;
      description?: string;
      colors?: string[];
      sizes?: string[];
      suggestedPrice?: number;
      category?: string;
    };
  }) => {
    // Combinar imagem principal com imagens adicionais
    const allImages = data.additionalImages && data.additionalImages.length > 0
      ? [data.imageUrl, ...data.additionalImages].join(', ')
      : data.imageUrl;

    setFormData(prev => ({
      ...prev,
      image_url: data.imageUrl,
      images: allImages,
      ...(data.productData?.name && { name: data.productData.name }),
      ...(data.productData?.description && { description: data.productData.description }),
      ...(data.productData?.suggestedPrice && { price: data.productData.suggestedPrice.toString() }),
      ...(data.productData?.colors && { colors: data.productData.colors.join(', ') }),
      ...(data.productData?.sizes && { sizes: data.productData.sizes.join(', ') }),
    }));

    // Tentar encontrar categoria correspondente
    if (data.productData?.category) {
      const matchedCategory = categories.find(
        cat => cat.name.toLowerCase().includes(data.productData!.category!.toLowerCase()) ||
               data.productData!.category!.toLowerCase().includes(cat.name.toLowerCase())
      );
      if (matchedCategory) {
        setFormData(prev => ({ ...prev, category_id: matchedCategory.id }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Produtos</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload with AI - DESTAQUE NO TOPO */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Upload de Imagem com IA</h3>
                  </div>
                  <ImageUploadWithAI
                    onImageAnalyzed={handleImageAnalyzed}
                    currentImageUrl={formData.image_url}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ex: Vestido Longo Solar"
                    />
                  </div>
                
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Descrição detalhada do produto"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preço Atual (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="289.90"
                    />
                  </div>
                  <div>
                    <Label htmlFor="original_price">Preço Original (R$)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) =>
                        setFormData({ ...formData, original_price: e.target.value })
                      }
                      placeholder="389.90"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Para exibir desconto</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sizes">Tamanhos Disponíveis</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="PP, P, M, G, GG ou 36, 38, 40, 42, 44"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separar por vírgula</p>
                </div>

                <div>
                  <Label htmlFor="colors">Cores Disponíveis</Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Amarelo Limão, Verde Menta, Rosa Claro"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separar por vírgula</p>
                </div>

                {/* Imagens por Cor */}
                {formData.colors && formData.colors.trim() && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Fotos por Cor/Estampa</h3>
                    </div>
                    <ColorImagesEditor
                      productId={editingProduct?.id}
                      colors={formData.colors.split(',').map(c => c.trim()).filter(c => c)}
                      colorImages={colorImages}
                      onChange={setColorImages}
                    />
                  </div>
                )}

                {/* Variantes de Estoque */}
                <div className="pt-4 border-t">
                  <ProductVariantsEditor
                    sizes={formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : []}
                    colors={formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : []}
                    basePrice={parseFloat(formData.price) || 0}
                    baseSku={formData.sku_base || formData.name.substring(0, 4).toUpperCase().replace(/\s+/g, '') || "PROD"}
                    variants={variants}
                    onChange={setVariants}
                  />
                </div>

                {/* SKU Base e Peso */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku_base">SKU Base</Label>
                    <Input
                      id="sku_base"
                      value={formData.sku_base}
                      onChange={(e) => setFormData({ ...formData, sku_base: e.target.value.toUpperCase() })}
                      placeholder="VEST"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Prefixo para SKUs das variantes</p>
                  </div>
                  <div>
                    <Label htmlFor="weight_grams">Peso (gramas) *</Label>
                    <Input
                      id="weight_grams"
                      type="number"
                      value={formData.weight_grams}
                      onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
                      placeholder="300"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Para cálculo de frete</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dimensions">Dimensões (AxLxP cm)</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="30x25x5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Altura x Largura x Profundidade para frete</p>
                </div>

                <div>
                  <Label htmlFor="images">Galeria de Imagens Adicionais</Label>
                  <Textarea
                    id="images"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    rows={2}
                    placeholder="https://exemplo.com/img1.jpg, https://exemplo.com/img2.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">URLs separadas por vírgula (para galeria de fotos)</p>
                </div>
                
                {variants.length === 0 && (
                  <div>
                    <Label htmlFor="stock">Estoque Total *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use as variantes acima para estoque por tamanho/cor</p>
                  </div>
                )}

                {/* SEO Fields */}
                <div className="pt-4 border-t space-y-4">
                  <h4 className="font-semibold text-sm">SEO (Otimização para Buscadores)</h4>
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder={formData.name || "Título para Google"}
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.meta_title.length}/60 caracteres</p>
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Descrição curta para resultados de busca"
                      maxLength={160}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.meta_description.length}/160 caracteres</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_new}
                      onChange={(e) =>
                        setFormData({ ...formData, is_new: e.target.checked })
                      }
                    />
                    <span className="text-sm">Produto Novo (badge "Novo")</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                    />
                    <span className="text-sm">Ativo (visível na loja)</span>
                  </label>
                </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Salvar Produto"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Products;
