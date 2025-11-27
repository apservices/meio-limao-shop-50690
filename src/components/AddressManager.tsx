import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CepInput } from "@/components/CepInput";
import { MapPin, Pencil, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

interface AddressManagerProps {
  addresses: AddressRow[];
  customerId: string;
  onRefetch: () => void;
}

export const AddressManager = ({ addresses, customerId, onRefetch }: AddressManagerProps) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    zipcode: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    address_type: string;
  }>({
    name: "",
    zipcode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    address_type: "both",
  });

  const handleEdit = (address: AddressRow) => {
    setEditingId(address.id);
    setFormData({
      name: address.name,
      zipcode: address.zipcode,
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      district: address.district,
      city: address.city,
      state: address.state,
      address_type: address.address_type,
    });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("addresses")
        .update({
          ...formData,
          complement: formData.complement || null,
        })
        .eq("id", editingId);

      if (error) throw error;

      toast({
        title: "Endereço atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });

      setEditingId(null);
      onRefetch();
    } catch (error) {
      console.error("Error updating address:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast({
        title: "Endereço removido",
        description: "O endereço foi excluído com sucesso.",
      });

      setDeletingId(null);
      onRefetch();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível remover o endereço.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // Remove default from all addresses
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("customer_id", customerId);

      // Set new default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId);

      if (error) throw error;

      toast({
        title: "Endereço padrão definido",
        description: "Este endereço será usado por padrão nas compras.",
      });

      onRefetch();
    } catch (error) {
      console.error("Error setting default address:", error);
      toast({
        title: "Erro ao definir padrão",
        description: "Não foi possível alterar o endereço padrão.",
        variant: "destructive",
      });
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case "billing": return "Cobrança";
      case "shipping": return "Entrega";
      case "both": return "Cobrança e Entrega";
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{address.name}</CardTitle>
                {address.is_default && (
                  <Badge variant="secondary" className="ml-2">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Padrão
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {!address.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingId === address.id ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do endereço</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Casa, Trabalho, etc."
                    />
                  </div>
                  <CepInput
                    value={formData.zipcode}
                    onChange={(value) => setFormData({ ...formData, zipcode: value })}
                    onAddressFound={(addr) => {
                      setFormData(prev => ({
                        ...prev,
                        street: addr.street,
                        district: addr.neighborhood,
                        city: addr.city,
                        state: addr.state,
                      }));
                    }}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Rua</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Complemento</Label>
                    <Input
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Estado (UF)</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Salvar</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="outline">{getAddressTypeLabel(address.address_type || "both")}</Badge>
                <p className="text-sm">
                  {address.street}, {address.number}
                  {address.complement && ` - ${address.complement}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.district} - {address.city}/{address.state}
                </p>
                <p className="text-sm text-muted-foreground">CEP: {address.zipcode}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
