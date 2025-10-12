export interface DemoResponse {
  message: string;
  timestamp: number;
}

export interface OrderRequest {
  name: string;
  email: string;
  whatsapp: string;
  currency: "USD" | "TND" | "EGP" | "EUR";
  items: Array<{ id: string; qty: number }>;
  promoCode?: string;
  notes?: string;
}

export interface OrderResponse {
  panierCode: string;
  whatsapp?: string | null;
  emailSent: boolean;
}

