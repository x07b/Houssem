import Layout from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

interface Category { id: string; name: string; slug: string }

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    function slugify(input: string) {
      return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }
    async function run() {
      setLoading(true);
      const { data: catsData } = await supabase.from("categories").select("id,name");
      const cats: Category[] = (catsData || []).map((c: any) => ({ id: String(c.id), name: c.name as string, slug: slugify(String(c.name)) }));
      const cat = cats.find(c=>c.slug===slug) || null;
      if (mounted) setCategory(cat);
      if (cat) {
        const { data: prodsData } = await supabase.from("products").select("id,title,description,price,image_url,category_id").eq("category_id", cat.id);
        const prods = (prodsData || []).map((row: any) => ({
          id: String(row.id),
          title: row.title,
          description: row.description || "",
          image: row.image_url || "",
          price: { USD: typeof row.price === "string" ? parseFloat(row.price) : Number(row.price || 0) },
          variants: [],
          categoryId: row.category_id ? String(row.category_id) : undefined,
        }));
        if (mounted) setProducts(prods);
      } else {
        if (mounted) setProducts([]);
      }
      setLoading(false);
      if (cat) {
        document.title = `${cat.name} – Store`;
        let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel','canonical');
          document.head.appendChild(link);
        }
        const isPlural = typeof window !== 'undefined' && window.location.pathname.startsWith('/categories/');
        link.href = `${window.location.origin}/${isPlural ? 'categories' : 'category'}/${cat.slug}`;
      }
    }
    run();
    return () => { mounted = false; };
  }, [slug]);

  return (
    <Layout>
      <h1 className="text-2xl md:text-3xl font-extrabold">{category?.name || slug}</h1>
      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <div className="mt-6 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold">No products yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">No items found for {category?.name ?? slug}. Add products from the admin area.</p>
            <div className="mt-4">
              <a href="/admin" className="underline">Go to Admin</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Layout>
  );
}
