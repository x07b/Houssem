import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface Category { id: string; name: string; slug: string; icon?: string; order?: number; isVisible?: boolean }

interface CategoriesCtx {
  categories: Category[];
}

const Ctx = createContext<CategoriesCtx | undefined>(undefined);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories").then(r=>r.json()).then((list: Category[])=>{
      setCategories(Array.isArray(list) ? list : []);
    }).catch(()=>setCategories([]));
  }, []);

  const value = useMemo(()=>({ categories }), [categories]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCategories() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}
