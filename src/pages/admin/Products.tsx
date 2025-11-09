import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
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
  });

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
      stock: parseInt(formData.stock),
      is_new: formData.is_new,
      is_active: formData.is_active,
      rating: 0,
      reviews_count: 0,
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id));
    } else {
      ({ error } = await supabase.from("products").insert([productData]));
    }

    if (error) {
      toast({ title: "Erro ao salvar produto", variant: "destructive" });
    } else {
      toast({ title: editingProduct ? "Produto atualizado!" : "Produto criado!" });
      setDialogOpen(false);
      resetForm();
      loadProducts();
    }

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
    });
    setDialogOpen(true);
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
    });
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
              <form onSubmit={handleSubmit} className="space-y-4">
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
                
                <div>
                  <Label htmlFor="image_url">URL da Imagem Principal *</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
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
                
                <div>
                  <Label htmlFor="stock">Estoque *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    placeholder="100"
                  />
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
