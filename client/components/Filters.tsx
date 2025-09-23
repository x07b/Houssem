import { useState, useMemo } from "react";
import { useProducts } from "@/context/ProductsContext";
import { AdminProduct, ProductCategory, ProductPlatform } from "@shared/entities";
import ProductCard from "@/components/ProductCard";

export default function Filters() {
  const { products } = useProducts();
  const [category, setCategory] = useState<"all" | ProductCategory>("all");
  const [platform, setPlatform] = useState<"all" | ProductPlatform>("all");
  const [min, setMin] = useState<number | "">("");
  const [max, setMax] = useState<number | "">("");

  const filtered = useMemo(() => {
    let list: AdminProduct[] = products;
    if (category !== "all") list = list.filter((p: any) => p.category === category);
    if (platform !== "all") list = list.filter((p: any) => p.platform === platform);
    if (min !== "") list = list.filter(p => (p.price?.USD ?? 0) >= Number(min));
    if (max !== "") list = list.filter(p => (p.price?.USD ?? 0) <= Number(max));
    return list;
  }, [products, category, platform, min, max]);

  return (
    <div className="mt-4">
      <div className="rounded-2xl border bg-card p-4 grid md:grid-cols-4 gap-3">
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <select className="rounded border px-3 py-2 bg-background" value={category} onChange={(e)=>setCategory(e.target.value as any)}>
            <option value="all">All</option>
            <option value="gaming">Gaming</option>
            <option value="giftcards">Gift Cards</option>
            <option value="software">Software</option>
            <option value="subscriptions">Subscriptions</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Platform</label>
          <select className="rounded border px-3 py-2 bg-background" value={platform} onChange={(e)=>setPlatform(e.target.value as any)}>
            <option value="all">All</option>
            <option value="pc">PC</option>
            <option value="steam">Steam</option>
            <option value="xbox">Xbox</option>
            <option value="playstation">PlayStation</option>
            <option value="nintendo">Nintendo</option>
            <option value="riot">Riot</option>
            <option value="origin">EA/Origin</option>
            <option value="uplay">Ubisoft</option>
            <option value="generic">Generic</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Min Price (USD)</label>
          <input type="number" className="rounded border px-3 py-2 bg-background" value={min} onChange={(e)=>setMin(e.target.value===""?"":Number(e.target.value))} />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Max Price (USD)</label>
          <input type="number" className="rounded border px-3 py-2 bg-background" value={max} onChange={(e)=>setMax(e.target.value===""?"":Number(e.target.value))} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => (
          <ProductCard key={`f-`+p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
