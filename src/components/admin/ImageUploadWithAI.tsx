import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadWithAIProps {
  onImageAnalyzed: (data: {
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
  }) => void;
  currentImageUrl?: string;
  currentAdditionalImages?: string[];
}

export const ImageUploadWithAI = ({ onImageAnalyzed, currentImageUrl, currentAdditionalImages }: ImageUploadWithAIProps) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string>(currentImageUrl || "");
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>(currentAdditionalImages || []);
  const { toast } = useToast();

  const uploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const analyzeWithAI = async (imageUrl: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product-image', {
        body: { imageUrl }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao analisar com IA:', error);
      toast({
        title: "Aviso",
        description: "Não foi possível analisar automaticamente. Preencha os campos manualmente.",
        variant: "default",
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Validar todos os arquivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede 5MB`,
          variant: "destructive",
        });
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: `${file.name} não é JPG, PNG ou WEBP`,
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      const file = files[0]; // Primeira imagem é a principal

      // 1. Upload da imagem principal
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      const mainImageUrl = await uploadToStorage(file);
      
      toast({
        title: "✓ Imagem principal enviada!",
        description: files.length > 1 ? "Enviando imagens adicionais..." : "Analisando com IA...",
      });

      // 2. Upload das imagens adicionais
      if (files.length > 1) {
        for (let i = 1; i < files.length; i++) {
          const additionalFile = files[i];
          const additionalUrl = await uploadToStorage(additionalFile);
          uploadedUrls.push(additionalUrl);
        }
        setAdditionalPreviews(prev => [...prev, ...uploadedUrls]);
        toast({
          title: `✓ ${files.length} imagens enviadas!`,
          description: "Analisando imagem principal com IA...",
        });
      }

      // 3. Analisar apenas a imagem principal com IA
      const aiData = await analyzeWithAI(mainImageUrl);

      // 4. Retornar dados
      onImageAnalyzed({
        imageUrl: mainImageUrl,
        additionalImages: uploadedUrls,
        productData: aiData || undefined
      });

      if (aiData) {
        toast({
          title: "✨ Análise concluída!",
          description: "Campos preenchidos automaticamente pela IA",
        });
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Tente novamente",
        variant: "destructive",
      });
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview("");
    setAdditionalPreviews([]);
    onImageAnalyzed({ imageUrl: "", additionalImages: [] });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-foreground">
            📸 Imagem Principal do Produto
          </Label>
          {preview && !uploading && !analyzing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearImage}
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Dimensões recomendadas:</strong> 1200×1200px (formato quadrado) • <strong>Formatos:</strong> JPG, PNG ou WEBP • <strong>Tamanho máx:</strong> 5MB
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="relative w-full aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-primary bg-muted">
            <img
              src={preview}
              alt="Imagem Principal"
              className="w-full h-full object-cover"
            />
            {(uploading || analyzing) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    {uploading ? 'Fazendo upload...' : 'Analisando com IA...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Images Preview */}
          {additionalPreviews.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Imagens Adicionais ({additionalPreviews.length})</p>
              <div className="grid grid-cols-4 gap-2">
                {additionalPreviews.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img
                      src={url}
                      alt={`Adicional ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {!preview && (
        <div className="border-3 border-dashed border-primary/40 rounded-lg p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold mb-2">Arraste suas imagens ou clique para fazer upload</p>
                <p className="text-sm text-muted-foreground mb-1">
                  Recomendado: 1200×1200px (quadrado) • Primeira imagem será a principal
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou WEBP • Máximo 5MB por imagem • Múltiplas imagens permitidas
                </p>
              </div>
              <Button type="button" variant="default" size="lg" className="mt-3" asChild>
                <span>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Selecionar Imagens e Analisar com IA
                </span>
              </Button>
            </div>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        💡 A IA irá analisar a imagem e preencher automaticamente os campos do produto
      </p>
    </div>
  );
};
