import { Button } from "@/components/ui/button";
import { AdminProduct, ProductVariant } from "@shared/entities";
import { useEffect, useState } from "react";

type Props = {
  initial?: Partial<AdminProduct>;
  onCancel: () => void;
  onSave: (data: Omit<AdminProduct, "id">) => void;
};

const emptyPrice = { USD: 0, EUR: 0, TND: 0, EGP: 0 } as const;

export default function ProductForm({ initial, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [image, setImage] = useState(initial?.image || "");
  const [price, setPrice] = useState(initial?.price || { ...emptyPrice });
  const [discountPercent, setDiscountPercent] = useState<number>(initial?.discountPercent || 0);
  const [variants, setVariants] = useState<ProductVariant[]>(initial?.variants || []);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<string>(String((initial as any)?.categoryId || ""));
  const [isConverting, setIsConverting] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result || "");
      try {
        const res = await fetch('/api/upload-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileBase64: base64 }) });
        if (res.ok) {
          const data = await res.json();
          setImage(String(data.url || base64));
        } else {
          setImage(base64);
        }
      } catch {
        setImage(base64);
      }
    };
    reader.readAsDataURL(f);
  }

  function addVariant() {
    setVariants((v)=>[...v, { id: crypto.randomUUID(), name: "", price: { ...emptyPrice } }]);
  }

  function updateVariant(idx: number, patch: Partial<ProductVariant>) {
    setVariants((v)=> v.map((it, i)=> i===idx ? { ...it, ...patch } : it));
  }

  function updateVarPrice(idx: number, currency: keyof typeof emptyPrice, value: number) {
    setVariants((v)=> v.map((it, i)=> i===idx ? { ...it, price: { ...it.price, [currency]: value } } : it));
  }

  function removeVariant(idx: number) {
    setVariants((v)=> v.filter((_, i)=> i!==idx));
  }

  // Auto-convert currency when TND is changed
  async function onPriceChange(currency: keyof typeof emptyPrice, value: number) {
    const newPrice = { ...price, [currency]: value };
    setPrice(newPrice);

    // Only auto-convert if changing TND
    if (currency === "TND" && value > 0) {
      setIsConverting(true);
      try {
        const res = await fetch('/api/admin/rate');
        const data = res.ok ? await res.json() : { usdToTnd: 0 };
        const usdToTnd = Number(data.usdToTnd || 0);
        setPrice({
          TND: value,
          USD: usdToTnd > 0 ? Number((value / usdToTnd).toFixed(2)) : 0,
          EUR: 0,
          EGP: 0,
        });
      } catch (error) {
        console.error("Currency conversion failed:", error);
      } finally {
        setIsConverting(false);
      }
    }
  }

  // Auto-convert variant price when TND is changed
  async function onVariantPriceChange(idx: number, currency: keyof typeof emptyPrice, value: number) {
    updateVarPrice(idx, currency, value);

    // Only auto-convert if changing TND
    if (currency === "TND" && value > 0) {
      setIsConverting(true);
      try {
        const res = await fetch('/api/admin/rate');
        const data = res.ok ? await res.json() : { usdToTnd: 0 };
        const usdToTnd = Number(data.usdToTnd || 0);
        setVariants((v) =>
          v.map((it, i) =>
            i === idx
              ? {
                  ...it,
                  price: {
                    TND: value,
                    USD: usdToTnd > 0 ? Number((value / usdToTnd).toFixed(2)) : 0,
                    EUR: 0,
                    EGP: 0,
                  },
                }
              : it
          )
        );
      } catch (error) {
        console.error("Currency conversion failed:", error);
      } finally {
        setIsConverting(false);
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) { setCategories([]); return; }
        const data = await res.json();
        setCategories(data.map((c: any)=> ({ id: String(c.id), name: c.name as string })));
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  function submit() {
    const payload: any = { title, description, image, price, discountPercent, variants };
    if (categoryId) payload.categoryId = categoryId;
    onSave(payload);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Name</label>
        <input className="rounded border px-3 py-2 bg-background" value={title} onChange={(e)=>setTitle(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Description</label>
        <textarea className="rounded border px-3 py-2 bg-background min-h-[100px]" value={description} onChange={(e)=>setDescription(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Image</label>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={onFile} />
          <input className="rounded border px-3 py-2 bg-background flex-1" placeholder="Image URL or base64" value={image} onChange={(e)=>setImage(e.target.value)} />
        </div>
        {image && <img src={image} alt="preview" className="mt-2 h-28 w-28 object-cover rounded" />}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Base Price</label>
          {isConverting && <span className="text-xs text-muted-foreground animate-pulse">Converting...</span>}
        </div>
        <p className="text-xs text-muted-foreground">💡 Enter TND price to auto-fill other currencies</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["TND","USD","EUR","EGP"] as const).map((k)=> (
            <div key={k} className="flex items-center gap-2">
              <span className="text-xs w-10 font-semibold">{k}</span>
              <input 
                type="number" 
                step="0.01"
                className="rounded border px-2 py-1 bg-background flex-1" 
                value={price[k]} 
                onChange={(e)=>onPriceChange(k, Number(e.target.value))} 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Discount %</label>
        <input type="number" className="rounded border px-3 py-2 bg-background w-32" value={discountPercent} onChange={(e)=>setDiscountPercent(Number(e.target.value))} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Category</label>
        <select className="rounded border px-3 py-2 bg-background w-full" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)}>
          <option value="">-- Select Category --</option>
          {categories.map(c=> (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Variants (optional)</label>
          <Button variant="outline" size="sm" onClick={addVariant}>Add Variant</Button>
        </div>
        {variants.length===0 ? (
          <p className="text-sm text-muted-foreground">No variants</p>
        ) : (
          <div className="grid gap-3">
            {variants.map((v, idx)=> (
              <div key={v.id} className="border rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <input className="rounded border px-3 py-2 bg-background flex-1" placeholder="Variant name" value={v.name} onChange={(e)=>updateVariant(idx, { name: e.target.value })} />
                  <Button variant="ghost" onClick={()=>removeVariant(idx)}>Remove</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {(["TND","USD","EUR","EGP"] as const).map((k)=> (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs w-10 font-semibold">{k}</span>
                      <input 
                        type="number" 
                        step="0.01"
                        className="rounded border px-2 py-1 bg-background flex-1" 
                        value={v.price[k]} 
                        onChange={(e)=>onVariantPriceChange(idx, k, Number(e.target.value))} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={submit}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
