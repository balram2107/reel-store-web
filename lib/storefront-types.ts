export type Highlight = "new" | "bestsellers" | "sale" | "gifts";
export type Template = "classic" | "insta_aesthetic";

export type ProductRow = {
  id: number;
  name: string;
  slug: string;
  price_paise: number;
  mrp_paise: number | null;
  cover_url: string | null;
  card_url: string | null;
  in_stock: boolean;
  tags: Highlight[];
  category: { id: number; name: string; slug: string } | null;
  max_quantity: number | null;
  discount_percent: number;
  variants: { name: string; options: string[] }[];
};

export type ProductDetail = ProductRow & {
  description: string | null;
  stock_label: string | null;
  images: {
    id: number;
    url: string;
    thumb_url: string;
    position: number;
    cover: boolean;
  }[];
  delivery_charge_paise: number;
};

export type ThemeSettings = {
  banner_height?: "small" | "medium" | "large";
  text_alignment?: "left" | "center";
  corner_style?: "soft" | "rounded" | "square";
  font_style?: "modern" | "classic" | "elegant";
  phone_columns?: "1" | "2";
  image_ratio?: "square" | "portrait" | "landscape";
  discount_badge?: boolean;
  button_style?: "filled" | "outline" | "soft";
  show_stats?: boolean;
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_label?: string;
  hero_cta_target?: "shop" | "new" | "sale" | "bestsellers";
  [k: string]: unknown;
};

export type Store = {
  slug: string;
  name: string;
  bio: string | null;
  about: string | null;
  shipping_policy: string | null;
  return_policy: string | null;
  dispatch_note: string | null;
  return_note: string | null;
  instagram_handle: string | null;
  instagram_url: string | null;
  contact: { email: string | null; phone: string | null };
  logo_url: string | null;
  banner_url: string | null;
  status: "open" | "closed" | "suspended" | "ended";
  unavailable_message: string | null;
  theme: {
    template: Template;
    button: string;
    accent: string;
    background: string;
    settings: ThemeSettings;
  };
  layout: string[];
  announcement: { text: string; color: string } | null;
  links: { label: string; url: string }[];
  whatsapp_number: string | null;
  payments: { upi: boolean; cod: boolean };
  delivery: {
    charge_paise: number;
    free_above_paise: number | null;
    pickup: boolean;
  };
  counts: { products: number; categories: number; orders: number | null };
  highlights: unknown;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  cover_url: string | null;
};
export type Categories = {
  categories: Category[];
  totals: { all: number; sale: number; new: number; bestsellers: number };
};

export type ProductQuery = {
  page?: number;
  per_page?: number;
  highlight?: Highlight;
  category?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  min_price_paise?: number;
  max_price_paise?: number;
  in_stock?: boolean;
};
export type ProductList = {
  products: ProductRow[];
  meta: { page: number; per_page: number; total: number };
};

export type CartLine = {
  product_id: number;
  slug: string;
  variant: Record<string, string>;
  quantity: number;
};
export type QuoteItem = {
  product_id: number;
  name: string;
  slug: string;
  variant: Record<string, string>;
  mrp_paise: number | null;
  max_quantity: number | null;
  cover_url: string | null;
  quantity: number;
  unit_price_paise: number;
  line_total_paise: number;
  available: boolean;
};
export type Quote = {
  items: QuoteItem[];
  subtotal_paise: number;
  delivery_paise: number;
  total_paise: number;
  issues: {
    product_id: number;
    code: "out_of_stock" | "unavailable" | "invalid_variant";
  }[];
  free_delivery_remaining_paise: number | null;
};
export type OrderRequest = {
  items: {
    product_id: number;
    variant: Record<string, string>;
    quantity: number;
  }[];
  customer: { name: string; phone: string; email: string };
  address: { line: string; city: string; state: string; pincode: string };
  payment_method: "upi" | "cod";
  consent: true;
};
export type OrderCreated = {
  order: {
    public_id: string;
    status: string;
    total_paise: number;
    payment_method: string;
  };
  tracking_token: string;
  next: { type: "pay" | "track"; path: string };
};
