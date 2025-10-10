import { createClient } from '@supabase/supabase-js';

const url = (import.meta as any).env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  ?? (import.meta as any).env.VITE_SUPABASE_URL as string | undefined;
const anon = (import.meta as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
  ?? (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string | undefined;

type Row = Record<string, any>;

function createFallback() {
  const api = {
    from(table: string) {
      let filters: { col?: string; val?: any } = {};
      const q = {
        eq(col: string, val: any) {
          filters = { col, val };
          return q;
        },
        async select(_columns?: string) {
          if (table === 'categories') {
            return { data: [], error: null };
          }
          if (table === 'products') {
            let data: Row[] = [];
            if (filters.col === 'category_id' && filters.val != null) {
              const id = String(filters.val);
              data = data.filter((p: any) => String(p.categoryId || p.category_id) === id);
            }
            data = data.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              price: p.price?.USD ?? p.price ?? 0,
              image_url: p.image || p.image_url || '',
              category_id: p.categoryId ?? p.category_id ?? null,
            }));
            return { data, error: null };
          }
          return { data: null as any, error: new Error(`Unknown table: ${table}`) };
        },
      };
      return q;
    },
  };
  return api;
}

export const supabase: any = (url && anon) ? createClient(url, anon) : createFallback();
