import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  min_subtotal_cents: number;
  first_purchase_only: boolean;
  free_shipping: boolean;
  max_uses?: number;
  used_count: number;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean;
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: 0,
    min_subtotal_cents: 0,
    first_purchase_only: false,
    free_shipping: false,
    max_uses: "",
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar cupons", variant: "destructive" });
      return;
    }

    setCoupons(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const couponData = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseFloat(formData.value.toString()),
      min_subtotal_cents: Math.round(parseFloat(formData.min_subtotal_cents.toString()) * 100),
      first_purchase_only: formData.first_purchase_only,
      free_shipping: formData.free_shipping,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
      is_active: formData.is_active,
    };

    let error;
    if (editingCoupon) {
      ({ error } = await supabase
        .from("coupons")
        .update(couponData)
        .eq("id", editingCoupon.id));
    } else {
      ({ error } = await supabase.from("coupons").insert([couponData]));
    }

    if (error) {
      toast({ title: "Erro ao salvar cupom", variant: "destructive" });
    } else {
      toast({
        title: editingCoupon ? "Cupom atualizado!" : "Cupom criado!",
      });
      setDialogOpen(false);
      resetForm();
      loadCoupons();
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este cupom?")) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir cupom", variant: "destructive" });
    } else {
      toast({ title: "Cupom excluído!" });
      loadCoupons();
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_subtotal_cents: coupon.min_subtotal_cents / 100,
      first_purchase_only: coupon.first_purchase_only,
      free_shipping: coupon.free_shipping,
      max_uses: coupon.max_uses?.toString() || "",
      starts_at: coupon.starts_at || "",
      ends_at: coupon.ends_at || "",
      is_active: coupon.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "percentage",
      value: 0,
      min_subtotal_cents: 0,
      first_purchase_only: false,
      free_shipping: false,
      max_uses: "",
      starts_at: "",
      ends_at: "",
      is_active: true,
    });
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Cupons de Desconto</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código do Cupom *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="PROMO20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Desconto *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">
                      Valor * {formData.type === "percentage" ? "(%)" : "(R$)"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_subtotal_cents">Valor Mínimo do Pedido (R$)</Label>
                    <Input
                      id="min_subtotal_cents"
                      type="number"
                      step="0.01"
                      value={formData.min_subtotal_cents}
                      onChange={(e) => setFormData({ ...formData, min_subtotal_cents: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="starts_at">Data de Início</Label>
                    <Input
                      id="starts_at"
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ends_at">Data de Término</Label>
                    <Input
                      id="ends_at"
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="max_uses">Limite de Usos (deixe vazio para ilimitado)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="first_purchase_only"
                      checked={formData.first_purchase_only}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, first_purchase_only: checked })
                      }
                    />
                    <Label htmlFor="first_purchase_only">Apenas primeira compra</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="free_shipping"
                      checked={formData.free_shipping}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, free_shipping: checked })
                      }
                    />
                    <Label htmlFor="free_shipping">Frete Grátis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Salvar Cupom"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cupons..."
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
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Benefícios</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum cupom encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.type === "percentage" ? "Porcentagem" : "Valor Fixo"}
                    </TableCell>
                    <TableCell>
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : `R$ ${coupon.value.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {coupon.free_shipping && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full w-fit">
                            Frete Grátis
                          </span>
                        )}
                        {coupon.first_purchase_only && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full w-fit">
                            1ª Compra
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.used_count} / {coupon.max_uses || "∞"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          coupon.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
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

export default Coupons;
