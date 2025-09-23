export type Currency = "USD" | "EUR" | "TND" | "EGP";

export interface ProductVariant {
  id: string;
  name: string;
  price: Record<Currency, number>;
}

export interface AdminProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  price: Record<Currency, number>;
  discountPercent?: number;
  variants?: ProductVariant[];
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  active: boolean;
}

export interface PromoCode {
  id: string;
  percent: number;
  active: boolean;
}

export interface HomeToggles {
  showNewsletter: boolean;
  showPremium: boolean;
  showPromo: boolean;
}

export interface OrderItem { id: string; qty: number; }

export interface Order {
  code: string;
  createdAt: number;
  customer: { name: string; email: string; whatsapp: string };
  currency: Currency;
  items: OrderItem[];
  status: "pending" | "paid" | "cancelled";
  promoCode?: string;
}

export interface StoreState {
  products: AdminProduct[];
  banners: Banner[];
  promos: PromoCode[];
  toggles: HomeToggles;
  orders: Order[];
}
