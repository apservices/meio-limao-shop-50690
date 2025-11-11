-- Create looks table for lookbook/style content
CREATE TABLE public.looks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  product_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.looks ENABLE ROW LEVEL SECURITY;

-- Anyone can view active looks
CREATE POLICY "Anyone can view active looks"
ON public.looks
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'));

-- Admins can manage looks
CREATE POLICY "Admins can manage looks"
ON public.looks
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_looks_updated_at
BEFORE UPDATE ON public.looks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();