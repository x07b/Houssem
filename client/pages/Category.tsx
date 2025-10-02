import Layout from "@/components/layout/Layout";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";

interface Category { id: string; name: string; slug: string }

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const fetchData = () => {
    const qs = params.toString();
    fetch(`/api/categories/${encodeURIComponent(slug)}/products${qs ? `?${qs}` : ""}`)
      .then(r=>r.json())
      .then((d)=>{ setCategory(d.category); setProducts(d.products||[]); })
      .catch(()=>{ setCategory(null); setProducts([]); });
  };

  useEffect(() => { fetchData(); }, [slug, params.toString()]);

  const onFilterChange = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  return (
    <Layout>
      {!category ? (
        <div className="py-10">Category not found.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="border rounded-2xl p-4 h-max bg-card">
            <h2 className="font-semibold mb-3">Filters</h2>
            <div className="grid gap-2 text-sm">
              <label className="grid gap-1">
                <span>Platform</span>
                <input className="rounded-md border bg-background px-2 py-1" value={params.get("platform")||""} onChange={(e)=>onFilterChange("platform", e.target.value)} />
              </label>
              <label className="grid gap-1">
                <span>Region</span>
                <input className="rounded-md border bg-background px-2 py-1" value={params.get("region")||""} onChange={(e)=>onFilterChange("region", e.target.value)} />
              </label>
              <label className="grid gap-1">
                <span>Sort</span>
                <select className="rounded-md border bg-background px-2 py-1" value={params.get("sort")||""} onChange={(e)=>onFilterChange("sort", e.target.value)}>
                  <option value="">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
            </div>
          </aside>
          <section>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{category.name}</h1>
            </div>
            {products.length === 0 ? (
              <p className="text-muted-foreground">No products found.</p>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p)=> (<ProductCard product={p} key={p.id} />))}
              </div>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}
