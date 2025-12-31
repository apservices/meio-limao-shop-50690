import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Star, Image, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColorImage {
  id?: string;
  product_id?: string;
  color_name: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface ColorImagesEditorProps {
  productId?: string;
  colors: string[];
  colorImages: ColorImage[];
  onChange: (images: ColorImage[]) => void;
}

export const ColorImagesEditor = ({
  productId,
  colors,
  colorImages,
  onChange,
}: ColorImagesEditorProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [expandedColor, setExpandedColor] = useState<string | null>(null);

  // Carregar imagens existentes quando o productId mudar
  useEffect(() => {
    if (productId) {
      loadExistingImages();
    }
  }, [productId]);

  const loadExistingImages = async () => {
    if (!productId) return;
    
    const { data, error } = await supabase
      .from("product_color_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");

    if (data && !error) {
      onChange(data.map(img => ({
        id: img.id,
        product_id: img.product_id,
        color_name: img.color_name,
        image_url: img.image_url,
        is_primary: img.is_primary ?? false,
        sort_order: img.sort_order ?? 0,
      })));
    }
  };

  const handleFileUpload = async (colorName: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(colorName);

    try {
      const uploadedImages: ColorImage[] = [];
      const existingImagesForColor = colorImages.filter(img => img.color_name === colorName);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `colors/${colorName.toLowerCase().replace(/\s+/g, '-')}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedImages.push({
          color_name: colorName,
          image_url: urlData.publicUrl,
          is_primary: existingImagesForColor.length === 0 && i === 0,
          sort_order: existingImagesForColor.length + i,
        });
      }

      const newImages = [...colorImages, ...uploadedImages];
      onChange(newImages);

      toast({
        title: `${uploadedImages.length} imagem(ns) adicionada(s)`,
        description: `Cor: ${colorName}`,
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleUrlAdd = (colorName: string, url: string) => {
    if (!url.trim()) return;

    const existingImagesForColor = colorImages.filter(img => img.color_name === colorName);
    
    const newImage: ColorImage = {
      color_name: colorName,
      image_url: url.trim(),
      is_primary: existingImagesForColor.length === 0,
      sort_order: existingImagesForColor.length,
    };

    onChange([...colorImages, newImage]);
  };

  const handleRemoveImage = (colorName: string, imageUrl: string) => {
    const filtered = colorImages.filter(
      img => !(img.color_name === colorName && img.image_url === imageUrl)
    );
    
    // Se removeu a imagem primária, definir a próxima como primária
    const remainingForColor = filtered.filter(img => img.color_name === colorName);
    if (remainingForColor.length > 0 && !remainingForColor.some(img => img.is_primary)) {
      remainingForColor[0].is_primary = true;
    }
    
    onChange(filtered);
  };

  const handleSetPrimary = (colorName: string, imageUrl: string) => {
    const updated = colorImages.map(img => ({
      ...img,
      is_primary: img.color_name === colorName 
        ? img.image_url === imageUrl 
        : img.is_primary,
    }));
    onChange(updated);
  };

  const getImagesForColor = (colorName: string) => {
    return colorImages.filter(img => img.color_name === colorName)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  if (colors.length === 0) {
    return (
      <div className="p-6 bg-muted/50 rounded-xl text-center">
        <Image className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          Adicione cores ao produto para fazer upload de imagens por cor
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Imagens por Cor</Label>
          <p className="text-sm text-muted-foreground">
            Faça upload de fotos específicas para cada cor/estampa
          </p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
          {colorImages.length} imagens
        </span>
      </div>

      <div className="space-y-3">
        {colors.map((colorName) => {
          const imagesForColor = getImagesForColor(colorName);
          const isExpanded = expandedColor === colorName;
          const hasImages = imagesForColor.length > 0;

          return (
            <div
              key={colorName}
              className={cn(
                "border rounded-xl overflow-hidden transition-all",
                isExpanded ? "bg-card shadow-md" : "bg-muted/30"
              )}
            >
              {/* Header da Cor */}
              <button
                type="button"
                onClick={() => setExpandedColor(isExpanded ? null : colorName)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 shadow-sm"
                    style={{
                      backgroundColor: getColorHex(colorName),
                    }}
                  />
                  <span className="font-medium">{colorName}</span>
                  {hasImages && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {imagesForColor.length} foto(s)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasImages && (
                    <img
                      src={imagesForColor.find(img => img.is_primary)?.image_url || imagesForColor[0].image_url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <span className="text-muted-foreground">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </div>
              </button>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t space-y-4">
                  {/* Grid de Imagens */}
                  {hasImages && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {imagesForColor.map((img, idx) => (
                        <div
                          key={img.image_url}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 group",
                            img.is_primary ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                          )}
                        >
                          <img
                            src={img.image_url}
                            alt={`${colorName} - ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Badge Principal */}
                          {img.is_primary && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              Principal
                            </div>
                          )}
                          
                          {/* Overlay de Ações */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!img.is_primary && (
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={() => handleSetPrimary(colorName, img.image_url)}
                                title="Definir como principal"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleRemoveImage(colorName, img.image_url)}
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload */}
                  <div className="flex gap-3">
                    <label className="flex-1">
                      <div className={cn(
                        "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors",
                        uploading === colorName && "opacity-50 pointer-events-none"
                      )}>
                        {uploading === colorName ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Enviando...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Clique para fazer upload
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG ou WEBP
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(colorName, e.target.files)}
                        disabled={uploading === colorName}
                      />
                    </label>
                  </div>

                  {/* URL Manual */}
                  <div className="flex gap-2">
                    <Input
                      id={`url-${colorName}`}
                      placeholder="Ou cole uma URL de imagem..."
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          handleUrlAdd(colorName, input.value);
                          input.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`url-${colorName}`) as HTMLInputElement;
                        if (input) {
                          handleUrlAdd(colorName, input.value);
                          input.value = "";
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper para tentar converter nome de cor em hex
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    "amarelo": "#FFD700",
    "amarelo limão": "#DFFF00",
    "verde": "#228B22",
    "verde menta": "#98FF98",
    "rosa": "#FF69B4",
    "rosa claro": "#FFB6C1",
    "azul": "#4169E1",
    "azul marinho": "#000080",
    "branco": "#FFFFFF",
    "preto": "#000000",
    "bege": "#F5F5DC",
    "marrom": "#8B4513",
    "laranja": "#FF8C00",
    "vermelho": "#DC143C",
    "roxo": "#8B008B",
    "lilás": "#C8A2C8",
    "cinza": "#808080",
    "coral": "#FF7F50",
    "turquesa": "#40E0D0",
    "dourado": "#FFD700",
    "prata": "#C0C0C0",
  };

  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || "#CBD5E1"; // Fallback cinza claro
}

export default ColorImagesEditor;
