import { Button } from "@/components/ui/button";
import { AdminProduct, ProductVariant } from "@shared/entities";
import { useState } from "react";

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
  const [category, setCategory] = useState<"gaming"|"giftcards"|"software"|"subscriptions">((initial as any)?.category || "gaming");
  const [platform, setPlatform] = useState<"pc"|"steam"|"xbox"|"playstation"|"nintendo"|"riot"|"origin"|"uplay"|"generic">((initial as any)?.platform || "generic");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
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

  function submit() {
    onSave({ title, description, image, price, discountPercent, variants, category, platform } as any);
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
        <label className="text-sm font-medium">Base Price</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["USD","EUR","TND","EGP"] as const).map((k)=> (
            <div key={k} className="flex items-center gap-2">
              <span className="text-xs w-10">{k}</span>
              <input type="number" className="rounded border px-2 py-1 bg-background flex-1" value={price[k]} onChange={(e)=>setPrice({...price, [k]: Number(e.target.value)})} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Discount %</label>
        <input type="number" className="rounded border px-3 py-2 bg-background w-32" value={discountPercent} onChange={(e)=>setDiscountPercent(Number(e.target.value))} />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Category</label>
          <select className="rounded border px-3 py-2 bg-background" value={category} onChange={(e)=>setCategory(e.target.value as any)}>
            <option value="gaming">Gaming</option>
            <option value="giftcards">Gift Cards</option>
            <option value="software">Software</option>
            <option value="subscriptions">Subscriptions</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Platform</label>
          <select className="rounded border px-3 py-2 bg-background" value={platform} onChange={(e)=>setPlatform(e.target.value as any)}>
            <option value="generic">Generic</option>
            <option value="pc">PC</option>
            <option value="steam">Steam</option>
            <option value="xbox">Xbox</option>
            <option value="playstation">PlayStation</option>
            <option value="nintendo">Nintendo</option>
            <option value="riot">Riot</option>
            <option value="origin">EA/Origin</option>
            <option value="uplay">Ubisoft</option>
          </select>
        </div>
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
                  {(["USD","EUR","TND","EGP"] as const).map((k)=> (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs w-10">{k}</span>
                      <input type="number" className="rounded border px-2 py-1 bg-background flex-1" value={v.price[k]} onChange={(e)=>updateVarPrice(idx, k, Number(e.target.value))} />
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
