import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

interface Look {
  id: string;
  title: string;
  description: string;
  image_url: string;
  product_ids: string[];
  is_active: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
}

const AdminLooks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [looks, setLooks] = useState<Look[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLook, setEditingLook] = useState<Look | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    product_ids: [] as string[],
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    loadLooks();
    loadProducts();
  }, []);

  const loadLooks = async () => {
    try {
      const { data, error } = await supabase
        .from("looks")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLooks(data || []);
    } catch (error) {
      console.error("Error loading looks:", error);
      toast({
        title: "Erro ao carregar looks",
        description: "Não foi possível carregar os looks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLook) {
        const { error } = await supabase
          .from("looks")
          .update(formData)
          .eq("id", editingLook.id);

        if (error) throw error;

        toast({
          title: "Look atualizado",
          description: "O look foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase.from("looks").insert([formData]);

        if (error) throw error;

        toast({
          title: "Look criado",
          description: "O look foi criado com sucesso",
        });
      }

      resetForm();
      setDialogOpen(false);
      loadLooks();
    } catch (error) {
      console.error("Error saving look:", error);
      toast({
        title: "Erro ao salvar look",
        description: "Não foi possível salvar o look",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este look?")) return;

    try {
      const { error } = await supabase.from("looks").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Look excluído",
        description: "O look foi excluído com sucesso",
      });

      loadLooks();
    } catch (error) {
      console.error("Error deleting look:", error);
      toast({
        title: "Erro ao excluir look",
        description: "Não foi possível excluir o look",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (look: Look) => {
    setEditingLook(look);
    setFormData({
      title: look.title,
      description: look.description,
      image_url: look.image_url,
      product_ids: look.product_ids || [],
      is_active: look.is_active,
      sort_order: look.sort_order,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLook(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      product_ids: [],
      is_active: true,
      sort_order: 0,
    });
  };

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Gerenciar Looks</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Look
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLook ? "Editar Look" : "Novo Look"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL da Imagem *</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="sort_order">Ordem de Exibição</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked as boolean })
                  }
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>

              <div>
                <Label>Produtos Associados</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={formData.product_ids.includes(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                      <Label
                        htmlFor={`product-${product.id}`}
                        className="cursor-pointer"
                      >
                        {product.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingLook ? "Atualizar" : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {looks.map((look) => (
            <TableRow key={look.id}>
              <TableCell>{look.title}</TableCell>
              <TableCell>{look.product_ids?.length || 0} produtos</TableCell>
              <TableCell>{look.sort_order}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    look.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {look.is_active ? "Ativo" : "Inativo"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(look)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(look.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminLooks;
