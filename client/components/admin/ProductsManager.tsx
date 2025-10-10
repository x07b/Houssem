import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductForm from "./ProductForm";
import { AdminProduct } from "@shared/entities";
import { toast } from "@/hooks/use-toast";

function useAuthedFetch(token: string | null) {
  return async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      ...(init || {}),
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(init?.headers || {}),
      },
    });
    const text = await res.text();
    let data: any = undefined;
    try { data = text ? JSON.parse(text) : undefined; } catch { /* keep raw */ }
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  };
}

export default function ProductsManager({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  useEffect(() => {
    afetch("/api/admin/products").then((rows: any[]) => {
      const mapped: AdminProduct[] = (rows || []).map((resp: any) => ({
        id: String(resp.id),
        title: resp.title,
        description: resp.description || "",
        image: resp.image_url || "",
        price: { USD: typeof resp.price === 'string' ? parseFloat(resp.price) : Number(resp.price || 0) },
        variants: [],
        categoryId: resp.category_id ? String(resp.category_id) : undefined,
      }));
      setItems(mapped);
    }).catch((e)=>{
      toast({ title: "Failed to load products", description: String(e?.message || e), variant: "destructive" as any });
    });
  }, []);

  return (
    <div>
      {editing ? (
        <div className="border rounded-2xl p-4">
          <h3 className="font-semibold mb-2">Edit Product</h3>
          <ProductForm
            initial={editing}
            onCancel={()=>setEditing(null)}
            onSave={async (data)=>{
              try {
                const payload = {
                  id: editing.id,
                  title: data.title,
                  description: data.description,
                  price: Number(data.price?.USD ?? 0),
                  image_url: data.image || "",
                  category_id: (data as any).categoryId ? String((data as any).categoryId) : null,
                };
                const resp = await afetch(`/api/admin/products`, { method: "PUT", body: JSON.stringify(payload) });
                setItems((list)=> list.map(it=> it.id===editing.id ? {
                  id: String(resp.id),
                  title: resp.title,
                  description: resp.description || "",
                  image: resp.image_url || "",
                  price: { USD: typeof resp.price === 'string' ? parseFloat(resp.price) : Number(resp.price || 0) },
                  variants: [],
                  categoryId: resp.category_id ? String(resp.category_id) : undefined,
                } : it));
                setEditing(null);
              } catch (e: any) {
                toast({ title: "Update failed", description: String(e?.message || e), variant: "destructive" as any });
              }
            }}
          />
        </div>
      ) : creating ? (
        <div className="border rounded-2xl p-4">
          <h3 className="font-semibold mb-2">New Product</h3>
          <ProductForm
            onCancel={()=>setCreating(false)}
            onSave={async (data)=>{
              try {
                const payload = {
                  title: data.title,
                  description: data.description,
                  price: Number(data.price?.USD ?? 0),
                  image_url: data.image || "",
                  category_id: (data as any).categoryId ? String((data as any).categoryId) : null,
                };
                const resp = await afetch("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
                setItems((p)=>[...p, {
                  id: String(resp.id),
                  title: resp.title,
                  description: resp.description || "",
                  image: resp.image_url || "",
                  price: { USD: typeof resp.price === 'string' ? parseFloat(resp.price) : Number(resp.price || 0) },
                  variants: [],
                  categoryId: resp.category_id ? String(resp.category_id) : undefined,
                }]);
                setCreating(false);
              } catch (e: any) {
                toast({ title: "Create failed", description: String(e?.message || e), variant: "destructive" as any });
              }
            }}
          />
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <Button onClick={()=>setCreating(true)}>New Product</Button>
        </div>
      )}

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p)=> (
          <div key={p.id} className="border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              {p.image && <img src={p.image} alt="" className="h-14 w-14 object-cover rounded" />}
              <div className="flex-1">
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.id}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={()=>setEditing(p)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={async()=>{
                  try {
                    await afetch(`/api/admin/products`, { method: "DELETE", body: JSON.stringify({ id: p.id }) });
                    setItems((list)=> list.filter(it=>it.id!==p.id));
                  } catch (e: any) {
                    toast({ title: "Delete failed", description: String(e?.message || e), variant: "destructive" as any });
                  }
                }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
