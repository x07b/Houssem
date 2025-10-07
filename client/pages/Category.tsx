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
      const cats: Category[] = await fetch("/api/categories", { cache: "no-store" }).then(r=>r.json());
      const cat = cats.find(c=>c.slug===slug) || null;
      if (mounted) setCategory(cat);
      const prods = await fetch(`/api/products?category=${encodeURIComponent(slug || "")}`, { cache: "no-store" }).then(r=>r.json());
      if (mounted) setProducts(prods);
      setLoading(false);
      if (cat) {
        document.title = `${cat.name} – Store`;
        let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel','canonical');
          document.head.appendChild(link);
        }
        link.href = `${window.location.origin}/category/${cat.slug}`;
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
            <p className="mt-1 text-sm text-muted-foreground">We’re adding items to {category?.name ?? slug} soon.</p>
            <div className="mt-4">
              <a href="/" className="underline">Back to Home</a>
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
