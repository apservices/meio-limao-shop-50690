import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Search } from "lucide-react";
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
import AdminLayout from "@/components/AdminLayout";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  seo_title?: string;
  seo_description?: string;
  is_active: boolean;
  sort_order: number;
}

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    seo_title: "",
    seo_description: "",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order");

    if (error) {
      toast({ title: "Erro ao carregar coleções", variant: "destructive" });
      return;
    }

    setCollections(data || []);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const collectionData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    };

    let error;
    if (editingCollection) {
      ({ error } = await supabase
        .from("collections")
        .update(collectionData)
        .eq("id", editingCollection.id));
    } else {
      ({ error } = await supabase.from("collections").insert([collectionData]));
    }

    if (error) {
      toast({ title: "Erro ao salvar coleção", variant: "destructive" });
    } else {
      toast({
        title: editingCollection ? "Coleção atualizada!" : "Coleção criada!",
      });
      setDialogOpen(false);
      resetForm();
      loadCollections();
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta coleção?")) return;

    const { error } = await supabase.from("collections").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir coleção", variant: "destructive" });
    } else {
      toast({ title: "Coleção excluída!" });
      loadCollections();
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      image_url: collection.image_url || "",
      seo_title: collection.seo_title || "",
      seo_description: collection.seo_description || "",
      is_active: collection.is_active,
      sort_order: collection.sort_order,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCollection(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      seo_title: "",
      seo_description: "",
      is_active: true,
      sort_order: 0,
    });
  };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Coleções</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Coleção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCollection ? "Editar Coleção" : "Nova Coleção"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
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
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="seo_title">SEO: Título</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) =>
                      setFormData({ ...formData, seo_title: e.target.value })
                    }
                    placeholder="Máximo 60 caracteres"
                  />
                </div>
                <div>
                  <Label htmlFor="seo_description">SEO: Descrição</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) =>
                      setFormData({ ...formData, seo_description: e.target.value })
                    }
                    rows={2}
                    placeholder="Máximo 160 caracteres"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sort_order">Ordem de Exibição</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Ativa</Label>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Salvar Coleção"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar coleções..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma coleção encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.name}</TableCell>
                    <TableCell className="text-muted-foreground">{collection.slug}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          collection.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {collection.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </TableCell>
                    <TableCell>{collection.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(collection)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(collection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Collections;
