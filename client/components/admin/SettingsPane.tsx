import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HomeToggles } from "@shared/entities";

function useAuthedFetch(token: string | null) {
  return async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...(init||{}), headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" , ...(init?.headers||{}) } });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };
}

export default function SettingsPane({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [toggles, setToggles] = useState<HomeToggles>({ showNewsletter:true, showPremium:true, showPromo:true });

  useEffect(() => { afetch("/api/admin/toggles").then(setToggles); }, []);

  const save = async () => {
    const resp = await afetch("/api/admin/toggles", { method:"PUT", body: JSON.stringify(toggles) });
    setToggles(resp);
  };

  return (
    <div>
      <div className="grid gap-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={toggles.showNewsletter} onChange={(e)=>setToggles({...toggles, showNewsletter:e.target.checked})} /> Newsletter</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={toggles.showPremium} onChange={(e)=>setToggles({...toggles, showPremium:e.target.checked})} /> Premium</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={toggles.showPromo} onChange={(e)=>setToggles({...toggles, showPromo:e.target.checked})} /> Promo Banner</label>
      </div>
      <div className="pt-3"><Button onClick={save}>Save</Button></div>
    </div>
  );
}
