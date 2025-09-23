import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useProducts } from "@/context/ProductsContext";

export interface CartItem {
  id: string; // product id
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  totalUSD: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (id: string, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { id, qty }];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const { getUSDPrice } = useProducts();
  const totalUSD = useMemo(() => items.reduce((sum, it) => sum + (getUSDPrice(it.id) || 0) * it.qty, 0), [items, getUSDPrice]);

  const value = useMemo(() => ({ items, add, remove, clear, totalUSD }), [items, totalUSD]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
