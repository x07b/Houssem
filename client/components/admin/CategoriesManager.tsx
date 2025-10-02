import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Category { id?: string; name: string; slug: string; icon?: string; order?: number; isVisible?: boolean }

export default function CategoriesManager({ token }: { token: string | null }) {
  const [list, setList] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>({ name: "", slug: "", icon: "", order: 0, isVisible: true });

  const afetch = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...(init||{}), headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" , ...(init?.headers||{}) } });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };

  const load = () => afetch("/api/admin/categories").then(setList).catch(()=>setList([]));
  useEffect(() => { if (token) load(); }, [token]);

  const submit = async () => {
    await afetch("/api/admin/categories", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", slug: "", icon: "", order: 0, isVisible: true });
    load();
  };

  const del = async (id: string) => { await afetch(`/api/admin/categories/${id}`, { method: "DELETE" }); load(); };

  return (
    <div className="grid gap-6">
      <div className="border rounded-2xl p-4 bg-card">
        <h3 className="font-semibold mb-3">Create / Edit Category</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>Name</span>
            <input className="rounded-md border bg-background px-2 py-1" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Slug</span>
            <input className="rounded-md border bg-background px-2 py-1" value={form.slug} onChange={(e)=>setForm({ ...form, slug: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Icon</span>
            <input className="rounded-md border bg-background px-2 py-1" value={form.icon||""} onChange={(e)=>setForm({ ...form, icon: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Order</span>
            <input type="number" className="rounded-md border bg-background px-2 py-1" value={form.order||0} onChange={(e)=>setForm({ ...form, order: Number(e.target.value) })} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isVisible!==false} onChange={(e)=>setForm({ ...form, isVisible: e.target.checked })} /> Visible
          </label>
        </div>
        <div className="mt-3"><Button onClick={submit}>Save</Button></div>
      </div>

      <div className="border rounded-2xl p-4 bg-card">
        <h3 className="font-semibold mb-3">Categories</h3>
        <ul className="divide-y">
          {list.map((c)=> (
            <li key={c.slug} className="py-2 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{c.name} {c.isVisible===false && <span className="text-xs text-muted-foreground">(hidden)</span>}</div>
                <div className="text-muted-foreground">/{c.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={()=>setForm(c)}>Edit</Button>
                <Button variant="destructive" onClick={()=>del(c.id!)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
