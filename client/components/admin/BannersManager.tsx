import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Banner } from "@shared/entities";

function useAuthedFetch(token: string | null) {
  return async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...(init||{}), headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" , ...(init?.headers||{}) } });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };
}

export default function BannersManager({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [items, setItems] = useState<Banner[]>([]);

  useEffect(() => { afetch("/api/admin/banners").then(setItems); }, []);

  const add = async () => {
    const title = prompt("Banner title") || "";
    if (!title) return;
    const resp = await afetch("/api/admin/banners", { method:"POST", body: JSON.stringify({ title, image: "", active: true }) });
    setItems((b)=>[...b, resp]);
  };

  return (
    <div>
      <div className="flex justify-end"><Button onClick={add}>Add Banner</Button></div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((b)=> (
          <div key={b.id} className="border rounded-2xl p-4">
            <div className="font-semibold">{b.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{b.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
