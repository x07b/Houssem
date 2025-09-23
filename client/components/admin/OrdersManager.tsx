import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Order } from "@shared/entities";

function useAuthedFetch(token: string | null) {
  return async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...(init||{}), headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" , ...(init?.headers||{}) } });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };
}

export default function OrdersManager({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [items, setItems] = useState<Order[]>([]);

  useEffect(() => { afetch("/api/admin/orders").then(setItems); }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Panier</th>
            <th className="py-2">Customer</th>
            <th className="py-2">Subtotal</th>
            <th className="py-2">Currency</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(o => (
            <tr key={o.code} className="border-b">
              <td className="py-2 font-medium">{o.code}</td>
              <td className="py-2">{o.customer.name} — {o.customer.email}</td>
              <td className="py-2">{o.subtotal.toFixed(2)}</td>
              <td className="py-2">{o.currency}</td>
              <td className="py-2 capitalize">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
