import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PromoCode } from "@shared/entities";

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

export default function PromosManager({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [items, setItems] = useState<PromoCode[]>([]);

  useEffect(() => { afetch("/api/admin/promos").then(setItems); }, []);

  const add = async () => {
    const id = (prompt("Promo code (e.g. SAVE20)")||"").toUpperCase();
    const percent = Number(prompt("Percent")||"0");
    if (!id || !percent) return;
    const resp = await afetch("/api/admin/promos", { method:"POST", body: JSON.stringify({ id, percent, active: true }) });
    setItems((p)=>[...p, resp]);
  };

  return (
    <div>
      <div className="flex justify-end"><Button onClick={add}>Add Promo</Button></div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p)=> (
          <div key={p.id} className="border rounded-2xl p-4">
            <div className="font-semibold">{p.id}</div>
            <div className="text-xs text-muted-foreground mt-1">{p.percent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
