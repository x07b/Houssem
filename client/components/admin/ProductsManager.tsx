import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductForm from "./ProductForm";
import { AdminProduct } from "@shared/entities";

function useAuthedFetch(token: string | null) {
  return async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...(init||{}), headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" , ...(init?.headers||{}) } });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };
}

export default function ProductsManager({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  useEffect(() => { afetch("/api/admin/products").then(setItems); }, []);

  return (
    <div>
      {editing ? (
        <div className="border rounded-2xl p-4">
          <h3 className="font-semibold mb-2">Edit Product</h3>
          <ProductForm
            initial={editing}
            onCancel={()=>setEditing(null)}
            onSave={async (data)=>{
              const resp = await afetch(`/api/admin/products/${editing.id}`, { method:"PUT", body: JSON.stringify(data) });
              setItems((list)=> list.map(it=> it.id===editing.id ? resp : it));
              setEditing(null);
            }}
          />
        </div>
      ) : creating ? (
        <div className="border rounded-2xl p-4">
          <h3 className="font-semibold mb-2">New Product</h3>
          <ProductForm
            onCancel={()=>setCreating(false)}
            onSave={async (data)=>{
              const resp = await afetch("/api/admin/products", { method:"POST", body: JSON.stringify(data) });
              setItems((p)=>[...p, resp]);
              setCreating(false);
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
                  await afetch(`/api/admin/products/${p.id}`, { method:"DELETE" });
                  setItems((list)=> list.filter(it=>it.id!==p.id));
                }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
