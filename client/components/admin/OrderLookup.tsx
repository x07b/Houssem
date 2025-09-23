import { useState } from "react";
import { Button } from "@/components/ui/button";

function useAuthedFetch(token: string | null) {
  return async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...(init||{}), headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" , ...(init?.headers||{}) } });
    return res.json();
  };
}

export default function OrderLookup({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [searchCode, setSearchCode] = useState("");
  const [foundOrder, setFoundOrder] = useState<any | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Panier Lookup</h2>
        <div className="flex gap-2">
          <input className="rounded-2xl border bg-background px-3 py-2" placeholder="PNR-12345" value={searchCode} onChange={(e)=>setSearchCode(e.target.value)} />
          <Button onClick={async()=>{ setFoundOrder(await afetch(`/api/admin/orders/${encodeURIComponent(searchCode)}`)); }}>Search</Button>
        </div>
      </div>
      {foundOrder && (
        <div className="mt-4 border rounded-2xl p-4 text-sm">
          <div className="font-semibold">{foundOrder.code}</div>
          <div className="mt-1">{new Date(foundOrder.createdAt).toLocaleString()}</div>
          <div className="mt-2">Customer: {foundOrder.customer.name} — {foundOrder.customer.email} — {foundOrder.customer.whatsapp}</div>
          <ul className="mt-2 list-disc pl-5">
            {foundOrder.items.map((it:any)=> (<li key={it.id+it.qty}>{it.id} × {it.qty}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
