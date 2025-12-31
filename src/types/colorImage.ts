export interface ColorImage {
  id?: string;
  product_id?: string;
  color_name: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}
