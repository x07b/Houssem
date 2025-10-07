import Layout from "@/components/layout/Layout";
import AdminShell, { AdminSection } from "@/components/admin/AdminShell";
import ProductsManager from "@/components/admin/ProductsManager";
import BannersManager from "@/components/admin/BannersManager";
import PromosManager from "@/components/admin/PromosManager";
import SettingsPane from "@/components/admin/SettingsPane";
import OrderLookup from "@/components/admin/OrderLookup";
import CategoriesManager from "@/components/admin/CategoriesManager";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((list) => setOrders(list as any[]))
      .catch(() => setOrders([]));
  }, [token]);

  return (
    <Layout>
      <AdminShell
        section={section}
        onSelect={setSection}
        headerRight={<span className="text-sm text-muted-foreground">{orders.length} orders</span>}
      >
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg rounded-2xl border bg-background p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Order {selected.code}</h3>
                <button onClick={()=>setSelected(null)} className="text-sm underline">Close</button>
              </div>
              <div className="mt-3 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {selected?.customer?.name || "Guest"} — {selected?.customer?.email} — {selected?.customer?.whatsapp}</div>
                <div className="mt-1"><span className="text-muted-foreground">Created:</span> {new Date(selected.createdAt).toLocaleString()}</div>
                <ul className="mt-3 space-y-1">
                  {selected.items?.map((it:any)=> (<li key={it.id+it.qty} className="flex items-center justify-between"><span>{it.id}</span><span className="text-muted-foreground">× {it.qty}</span></li>))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {section === "dashboard" && (
          <div className="grid gap-6">
            <div className="border rounded-2xl p-4 bg-card">
              <h3 className="font-semibold">New Orders</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">No orders yet.</p>
              ) : (
                <ul className="mt-2 divide-y">
                  {orders.slice().reverse().slice(0, 10).map((o) => (
                    <li key={o.code} className="py-3 text-sm flex items-center justify-between hover:bg-accent/40 rounded-lg px-2 cursor-pointer" onClick={()=>setSelected(o)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-semibold truncate">{o?.customer?.name || "Guest"}</span>
                        <span className="font-mono text-xs text-muted-foreground">{o.code}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:inline">{new Date(o.createdAt).toLocaleString()}</span>
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{o.items?.length || 0}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <OrderLookup token={token} />
          </div>
        )}
        {section === "products" && <ProductsManager token={token} />}
        {section === "categories" && <CategoriesManager />}
        {section === "banners" && <BannersManager token={token} />}
        {section === "promos" && <PromosManager token={token} />}
        {section === "settings" && <SettingsPane token={token} />}
      </AdminShell>
    </Layout>
  );
}
