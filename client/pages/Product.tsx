import Layout from "@/components/layout/Layout";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/context/ProductsContext";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useEffect, useMemo, useState } from "react";
import { slugify } from "@/lib/utils";
import { BadgeCheck, MailCheck, ShieldCheck } from "lucide-react";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const { products } = useProducts();
  const { add } = useCart();
  const { format } = useCurrency();
  const [qty, setQty] = useState(1);

  const p = useMemo(() => {
    return products.find((x: any) => (x.slug || slugify(x.title || x.id)) === slug);
  }, [products, slug]);

  useEffect(() => {
    if (p) document.title = `${p.title} – UPORA`;
  }, [p]);

  if (!p) return (
    <Layout>
      <div className="py-10">Product not found.</div>
    </Layout>
  );

  const images: string[] = Array.isArray((p as any).images) && (p as any).images.length > 0 ? (p as any).images : [p.image].filter(Boolean);
  const [main] = images;

  return (
    <Layout>
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">→</span>
        {p.categoryId ? (
          <Link to={`/c/${(p as any).categorySlug || ""}`} className="hover:underline">{(p as any).category || "Category"}</Link>
        ) : (
          <span>Product</span>
        )}
        <span className="mx-2">→</span>
        <span className="text-foreground">{p.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border bg-card">
            {main && <img src={main} alt={p.title} className="h-full w-full object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((src, i) => (
                <button key={i} className="aspect-square overflow-hidden rounded-xl border bg-card">
                  <img src={src} alt={`${p.title} ${i+1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{p.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {(p as any).platform && <span className="rounded-full border px-2 py-0.5">{(p as any).platform}</span>}
            {(p as any).region && <span className="rounded-full border px-2 py-0.5">{(p as any).region}</span>}
            <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 px-2 py-0.5">Available</span>
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-4">
            <div className="flex items-end gap-3">
              <div className="text-3xl font-extrabold">{format(p.price.USD)}</div>
              <div className="text-xs text-muted-foreground">All taxes included where applicable.</div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border px-2 py-1">
                <button className="px-2" onClick={()=>setQty(Math.max(1, qty-1))}>-</button>
                <span className="w-8 text-center">{qty}</span>
                <button className="px-2" onClick={()=>setQty(qty+1)}>+</button>
              </div>
              <Button size="lg" className="flex-1" onClick={()=>add(p.id, qty)}>Add to Cart</Button>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2"><MailCheck className="h-4 w-4" /> Instant email delivery</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure payment</div>
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Digital product</div>
            </div>
          </div>

          {p.description && (
            <div className="prose dark:prose-invert mt-6 max-w-none">
              <h2>Overview</h2>
              <p>{p.description}</p>
            </div>
          )}

          {(p as any).redemption && (
            <div className="prose dark:prose-invert mt-6 max-w-none">
              <h2>Redemption Instructions</h2>
              <p>{(p as any).redemption}</p>
            </div>
          )}

          <div className="prose dark:prose-invert mt-6 max-w-none">
            <h2>Region/Platform Info</h2>
            <ul>
              {(p as any).platform && <li>Platform: {(p as any).platform}</li>}
              {(p as any).region && <li>Region: {(p as any).region}</li>}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
