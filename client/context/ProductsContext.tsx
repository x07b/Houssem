import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AdminProduct } from "@shared/entities";
import { supabase } from "@/lib/supabase";

interface ProductsCtx {
  products: AdminProduct[];
  productsById: Record<string, AdminProduct>;
  getUSDPrice: (id: string) => number;
}

const Ctx = createContext<ProductsCtx | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    fetch("/api/products").then(r=>r.json()).then(setProducts).catch(()=>setProducts([]));
  }, []);

  const productsById = useMemo(() => Object.fromEntries(products.map(p=>[p.id, p])), [products]);
  const getUSDPrice = (id: string) => productsById[id]?.price?.USD ?? 0;

  const value = useMemo(()=>({ products, productsById, getUSDPrice }), [products, productsById]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProducts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
