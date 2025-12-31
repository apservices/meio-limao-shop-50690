-- Tabela para armazenar imagens por cor do produto
CREATE TABLE public.product_color_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para busca rápida por produto e cor
CREATE INDEX idx_product_color_images_product_id ON public.product_color_images(product_id);
CREATE INDEX idx_product_color_images_color ON public.product_color_images(product_id, color_name);

-- Habilitar RLS
ALTER TABLE public.product_color_images ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Anyone can view product color images"
  ON public.product_color_images
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product color images"
  ON public.product_color_images
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_product_color_images_updated_at
  BEFORE UPDATE ON public.product_color_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();