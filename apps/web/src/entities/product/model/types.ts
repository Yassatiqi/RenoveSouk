export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  original_price?: number;
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: string;

  // Status
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  is_new: boolean;

  // Images
  image_url?: string;
  gallery_images?: string;

  // Relations
  category_id?: number;
  category_name?: string | null;
  category_slug?: string | null;

  // Metadata
  created_at?: string;
  updated_at?: string;
};
