export type Theme = {
  template: "classic" | "insta_aesthetic";
  button: string;
  accent: string;
  background: string;
};
export type Meta = { page: number; per_page: number; total: number };
export type Img = {
  id: number;
  url: string;
  thumb_url: string;
  position: number;
  cover: boolean;
};
export type Variant = { name: string; options: string[] };
export type PublicStore = {
  slug: string;
  name: string;
  bio?: string | null;
  instagram_handle?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  status: "open" | "closed" | "ended" | "suspended";
  unavailable_message?: string | null;
  theme: Theme;
  whatsapp_number?: string | null;
  payments: { upi: boolean; cod: boolean };
  delivery: {
    charge_paise: number;
    free_above_paise: number | null;
    pickup: boolean;
  };
  highlights: string[];
};
export type ProductRow = {
  id: number;
  name: string;
  price_paise: number;
  mrp_paise?: number | null;
  cover_url?: string | null;
  in_stock: boolean;
};
export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price_paise: number;
  mrp_paise?: number | null;
  in_stock: boolean;
  stock_label: string;
  images: Img[];
  variants: Variant[];
  delivery_charge_paise: number;
};
export type CartLine = {
  product_id: number;
  variant?: Record<string, string>;
  quantity: number;
};
export type QuoteItem = {
  product_id: number;
  name: string;
  variant?: Record<string, string>;
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
  issues: { product_id: number; code: string }[];
};
export type User = { id: number; email: string; role: "seller" | "admin" };
export type AuthStore = {
  id: number;
  slug: string;
  name: string;
  onboarding_complete: boolean;
  onboarding_step: number;
};
export type Session = {
  token: string;
  user: User;
  store: AuthStore | null;
  is_new_user: boolean;
};
export type Me = { user: User; store: AuthStore | null };
export type TimelineEvent = {
  key: string;
  label: string;
  state: "done" | "now" | "next";
};

export type OrderRow = {
  id: number;
  public_id: string;
  customer_name: string;
  total_paise: number;
  status: string;
  placed_at: string;
};
export type SellerOrder = {
  id: number;
  public_id: string;
  status: string;
  payment_method: "upi" | "cod";
  utr?: string | null;
  items: {
    name: string;
    variant?: Record<string, string>;
    quantity: number;
    line_total_paise: number;
  }[];
  delivery_paise: number;
  total_paise: number;
  customer: { name: string; phone: string; email: string };
  address: { line: string; city: string; state: string; pincode: string };
  timeline: TimelineEvent[];
  shipping: { courier: string | null; tracking_ref: string | null };
  can_cancel: boolean;
};
export type SellerProduct = {
  id: number;
  name: string;
  description?: string | null;
  price_paise: number;
  mrp_paise?: number | null;
  stock?: number | null;
  in_stock: boolean;
  status: "live" | "hidden";
  cover_url?: string | null;
  category_id?: number | null;
  variants: Variant[];
  tags: string[];
  visible: boolean;
  images: Img[];
};
export type SellerStore = {
  id: number;
  name: string;
  slug: string;
  instagram_handle?: string | null;
  category_id?: number | null;
  bio?: string | null;
  delivery_charge_paise?: number | null;
  free_delivery_above_paise?: number | null;
  pickup_enabled?: boolean;
  upi_id?: string | null;
  cod_enabled?: boolean;
  whatsapp_enabled?: boolean;
  whatsapp_number?: string | null;
  status: "open" | "closed";
  closing_date?: string | null;
  theme: Theme;
  features?: {
    whatsapp_available: boolean;
    digital_products: boolean;
    services: boolean;
  };
  ends_on?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  onboarding_complete: boolean;
};
export type Category = { id: number; name: string; slug: string };
export type AdminFeatures = {
  digital_products?: boolean;
  services?: boolean;
  whatsapp_button?: boolean;
};
export type AdminStore = {
  id: number;
  name: string;
  slug: string;
  status: "live" | "suspended";
  seller_email: string;
  features: AdminFeatures;
  ends_on?: string | null;
};
export type AdminRow = {
  id: number;
  name: string;
  slug: string;
  seller_email: string;
  orders_count: number;
  status: string;
};
