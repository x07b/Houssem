import Layout from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";

interface Category { id: string; name: string; slug: string }

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      const cats: Category[] = await fetch("/api/categories").then(r=>r.json());
      const cat = cats.find(c=>c.slug===slug) || null;
      if (mounted) setCategory(cat);
      const prods = await fetch(`/api/products?category=${encodeURIComponent(slug || "")}`).then(r=>r.json());
      if (mounted) setProducts(prods);
      setLoading(false);
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
        <p className="mt-4 text-sm text-muted-foreground">No products yet in this category.</p>
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
