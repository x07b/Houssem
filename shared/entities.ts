export interface AdminProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  price: {
    USD: number;
    EUR: number;
    TND: number;
    EGP: number;
  };
  discountPercent?: number;
  variants: ProductVariant[];
  categoryId?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: {
    USD: number;
    EUR: number;
    TND: number;
    EGP: number;
  };
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  published?: boolean;
}

export interface HomeToggles {
  showNewsletter: boolean;
  showPremium: boolean;
  showPromo: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  percent?: number; // Alias for backward compatibility
  active: boolean;
}

export interface Order {
  code: string;
  createdAt: number;
  customer: {
    name: string;
    email: string;
    whatsapp: string;
  };
  currency: "USD" | "TND" | "EGP" | "EUR";
  items: Array<{ id: string; qty: number }>;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  promoCode?: string;
  notes?: string;
  paymentId?: string;
  paymentStatus?: "pending" | "paid" | "failed";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  published?: boolean;
  parentId?: string;
}

export interface StoreState {
  products: AdminProduct[];
  banners: Banner[];
  promos: PromoCode[];
  categories?: Category[];
  toggles: HomeToggles;
  orders: Order[];
}

