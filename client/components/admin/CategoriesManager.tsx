import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Category { id: string; name: string; slug: string; published?: boolean }

export default function CategoriesManager() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const { data: list = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch("/api/categories", { cache: "no-store" });
      if (!r.ok) throw new Error("failed");
      return (await r.json()) as Category[];
    },
    staleTime: 60_000,
  });

  async function add() {
    const body = { name: name.trim() };
    if (!body.name) return;
    setLoading(true);
    const r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (!r.ok) { toast.error("Failed to create category"); return; }
    toast.success("Category added");
    setName("");
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function remove(id: string) {
    const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!r.ok) { toast.error("Cannot delete category in use"); return; }
    toast.success("Category deleted");
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <div className="border rounded-2xl p-4">
      <h3 className="font-semibold mb-3">Categories</h3>
      <div className="flex items-center gap-2">
        <input className="rounded border bg-background px-3 py-2 flex-1" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <Button onClick={add} disabled={loading}>Add Category</Button>
      </div>
      <ul className="mt-4 divide-y">
        {list.map(c => (
          <li key={c.id} className="py-2 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">/{c.slug}</div>
            </div>
            <Button variant="destructive" size="sm" onClick={()=>remove(c.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
