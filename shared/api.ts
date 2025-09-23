export interface DemoResponse {
  message: string;
}

export interface OrderRequest {
  name: string;
  email: string;
  whatsapp: string;
  currency: "USD" | "TND" | "EGP";
  items: { id: string; qty: number }[];
}

export interface OrderResponse {
  orderId: string;
  delivered: boolean;
}
