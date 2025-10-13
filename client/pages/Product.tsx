import Layout from "@/components/layout/Layout";
import { useParams } from "react-router-dom";
import { useProducts } from "@/context/ProductsContext";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const { productsById } = useProducts();
  const { add } = useCart();
  const { format, convertFromUSD } = useCurrency();
  const [wish, setWish] = useState<boolean>(false);
  const p = id ? productsById[id] : undefined;

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWish(Array.isArray(list) && id ? list.includes(id) : false);
  }, [id]);

  function toggleWish() {
    const raw = localStorage.getItem("wishlist");
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!id) return;
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    localStorage.setItem("wishlist", JSON.stringify(next));
    setWish(next.includes(id));
  }
  if (!p) return (
    <Layout>
      <div className="py-10">Product not found.</div>
    </Layout>
  );
  return (
    <Layout>
      <div className="grid gap-8 md:grid-cols-2">
        {p.image && (
          <div className="border rounded-2xl p-3 bg-card">
            <img src={p.image} alt={p.title} className="w-full rounded-xl object-cover" />
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{p.title}</h1>
              {p.id && (
                <div className="mt-1 text-sm text-muted-foreground">SKU: {p.id}</div>
              )}
            </div>
            <Button variant={wish ? "default" : "outline"} size="icon" className="rounded-full" onClick={toggleWish} aria-label="Add to wishlist">
              <Heart className={wish ? "fill-current" : ""} />
            </Button>
          </div>
          <p className="text-muted-foreground leading-relaxed">{p.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PriceBadge label="USD" value={p.price?.USD || 0} format={format} />
            <PriceBadge label="TND" value={convertFromUSD(p.price?.USD || 0, "TND")} format={format} currency="TND" />
            <PriceBadge label="EUR" value={convertFromUSD(p.price?.USD || 0, "EUR")} format={format} currency="EUR" />
            <PriceBadge label="EGP" value={convertFromUSD(p.price?.USD || 0, "EGP")} format={format} currency="EGP" />
          </div>

          <div className="pt-2">
            <Button onClick={() => add(p.id)} className="h-12 text-base">Add to Cart</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PriceBadge({ label, value, format, currency }: { label: string; value: number; format: (usd: number, to?: any)=>string; currency?: any }) {
  const formatted = useMemo(() => format(value, currency as any), [value, currency, format]);
  return (
    <div className="rounded-xl border bg-card px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{formatted}</div>
    </div>
  );
}
