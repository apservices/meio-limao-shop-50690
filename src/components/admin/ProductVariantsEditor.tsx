import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ProductVariant {
  id?: string;
  sku: string;
  option1_label: string;
  option1_value: string;
  option2_label: string;
  option2_value: string;
  price_cents: number;
  inventory_qty: number;
  weight_grams: number;
  is_active: boolean;
}

interface ProductVariantsEditorProps {
  sizes: string[];
  colors: string[];
  basePrice: number;
  baseSku?: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const generateSku = (baseSku: string, size: string, color: string): string => {
  const sizeCode = size.substring(0, 2).toUpperCase();
  const colorCode = color.substring(0, 3).toUpperCase().replace(/\s+/g, '');
  return `${baseSku}-${colorCode}-${sizeCode}`;
};

export const ProductVariantsEditor = ({
  sizes,
  colors,
  basePrice,
  baseSku = "PROD",
  variants,
  onChange,
}: ProductVariantsEditorProps) => {
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants);

  useEffect(() => {
    setLocalVariants(variants);
  }, [variants]);

  const generateAllVariants = () => {
    if (sizes.length === 0 || colors.length === 0) return;

    const newVariants: ProductVariant[] = [];
    const priceCents = Math.round(basePrice * 100);

    for (const color of colors) {
      for (const size of sizes) {
        const existingVariant = localVariants.find(
          v => v.option1_value === size && v.option2_value === color
        );

        if (existingVariant) {
          newVariants.push(existingVariant);
        } else {
          newVariants.push({
            sku: generateSku(baseSku, size, color),
            option1_label: "Tamanho",
            option1_value: size,
            option2_label: "Cor",
            option2_value: color,
            price_cents: priceCents,
            inventory_qty: 0,
            weight_grams: 300,
            is_active: true,
          });
        }
      }
    }

    setLocalVariants(newVariants);
    onChange(newVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], [field]: value };
    setLocalVariants(updated);
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    const updated = localVariants.filter((_, i) => i !== index);
    setLocalVariants(updated);
    onChange(updated);
  };

  const addSingleVariant = () => {
    const newVariant: ProductVariant = {
      sku: `${baseSku}-${Date.now().toString(36).toUpperCase()}`,
      option1_label: "Tamanho",
      option1_value: sizes[0] || "U",
      option2_label: "Cor",
      option2_value: colors[0] || "Único",
      price_cents: Math.round(basePrice * 100),
      inventory_qty: 0,
      weight_grams: 300,
      is_active: true,
    };
    const updated = [...localVariants, newVariant];
    setLocalVariants(updated);
    onChange(updated);
  };

  const totalStock = localVariants.reduce((sum, v) => sum + v.inventory_qty, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Variantes de Estoque</h4>
          <Badge variant="outline">{localVariants.length} variantes</Badge>
          <Badge variant="secondary">{totalStock} unidades total</Badge>
        </div>
        <div className="flex gap-2">
          {sizes.length > 0 && colors.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateAllVariants}
            >
              Gerar Todas Combinações
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSingleVariant}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Variante
          </Button>
        </div>
      </div>

      {localVariants.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">
            Nenhuma variante cadastrada.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Preencha tamanhos e cores acima, depois clique em "Gerar Todas Combinações"
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">SKU</th>
                  <th className="px-3 py-2 text-left font-medium">Tamanho</th>
                  <th className="px-3 py-2 text-left font-medium">Cor</th>
                  <th className="px-3 py-2 text-left font-medium">Estoque</th>
                  <th className="px-3 py-2 text-left font-medium">Peso (g)</th>
                  <th className="px-3 py-2 text-left font-medium">Preço (R$)</th>
                  <th className="px-3 py-2 text-center font-medium">Ativo</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {localVariants.map((variant, index) => (
                  <tr key={index} className="hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value)}
                        className="h-8 w-32 text-xs font-mono"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{variant.option1_value}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span>{variant.option2_value}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={variant.inventory_qty}
                        onChange={(e) => updateVariant(index, "inventory_qty", parseInt(e.target.value) || 0)}
                        className="h-8 w-20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={variant.weight_grams}
                        onChange={(e) => updateVariant(index, "weight_grams", parseInt(e.target.value) || 0)}
                        className="h-8 w-20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={(variant.price_cents / 100).toFixed(2)}
                        onChange={(e) => updateVariant(index, "price_cents", Math.round(parseFloat(e.target.value) * 100) || 0)}
                        className="h-8 w-24"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={variant.is_active}
                        onChange={(e) => updateVariant(index, "is_active", e.target.checked)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        💡 O estoque será controlado individualmente por cada variante (combinação de tamanho + cor).
        SKUs são gerados automaticamente mas podem ser editados.
      </p>
    </div>
  );
};

export default ProductVariantsEditor;
