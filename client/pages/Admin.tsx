import Layout from "@/components/layout/Layout";
import AdminShell, { AdminSection } from "@/components/admin/AdminShell";
import ProductsManager from "@/components/admin/ProductsManager";
import BannersManager from "@/components/admin/BannersManager";
import PromosManager from "@/components/admin/PromosManager";
import SettingsPane from "@/components/admin/SettingsPane";
import OrderLookup from "@/components/admin/OrderLookup";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [orders, setOrders] = useState<any[]>([]);

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
        {section === "dashboard" && (
          <div className="grid gap-6">
            <div className="border rounded-2xl p-4 bg-card">
              <h3 className="font-semibold">New Orders</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">No orders yet.</p>
              ) : (
                <ul className="mt-2 divide-y">
                  {orders.slice().reverse().slice(0, 10).map((o) => (
                    <li key={o.code} className="py-2 text-sm flex items-center justify-between">
                      <span className="font-mono">{o.code}</span>
                      <span>{new Date(o.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <OrderLookup token={token} />
          </div>
        )}
        {section === "products" && <ProductsManager token={token} />}
        {section === "banners" && <BannersManager token={token} />}
        {section === "promos" && <PromosManager token={token} />}
        {section === "settings" && <SettingsPane token={token} />}
      </AdminShell>
    </Layout>
  );
}
