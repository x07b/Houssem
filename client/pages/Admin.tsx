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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default function Admin() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<{
    totalOrders: number;
    uniqueCustomers: number;
    totalProducts: number;
    recentOrders: number;
    priorOrders: number;
    growthPercentage: number;
  }>({
    totalOrders: 0,
    uniqueCustomers: 0,
    totalProducts: 0,
    recentOrders: 0,
    priorOrders: 0,
    growthPercentage: 0,
  });

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    
    // Fetch metrics
    (async () => {
      try {
        const res = await fetch("/api/admin/metrics", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        const text = await res.text();
        let data: any = undefined;
        try { data = text ? JSON.parse(text) : undefined; } catch { /* keep raw */ }
        if (!res.ok) { return; }
        setMetrics(data || {
          totalOrders: 0,
          uniqueCustomers: 0,
          totalProducts: 0,
          recentOrders: 0,
          priorOrders: 0,
          growthPercentage: 0,
        });
      } catch {
        // Keep default metrics
      }
    })();

    // Fetch orders for recent orders list
    (async () => {
      try {
        const res = await fetch("/api/admin/orders?limit=10", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        const text = await res.text();
        let data: any = undefined;
        try { data = text ? JSON.parse(text) : undefined; } catch { /* keep raw */ }
        if (!res.ok) { setOrders([]); return; }
        // Handle new API response format with pagination
        const ordersData = data?.orders || data || [];
        setOrders((Array.isArray(ordersData) ? ordersData : []) as any[]);
      } catch {
        setOrders([]);
      }
    })();
  }, [token]);

  // Use metrics from API
  const totalOrders = metrics.totalOrders;
  const totalProducts = metrics.totalProducts;
  const totalCustomers = metrics.uniqueCustomers;
  const recentOrders = orders; // Already limited to 10 from API

  return (
    <AdminShell
      section={section}
      onSelect={setSection}
      headerRight={
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <span className="text-xs font-medium">Total Orders:</span>
            <span className="ml-2 font-bold">{totalOrders}</span>
          </div>
        </div>
      }
    >
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Order #{selected.code}</h3>
              <button onClick={()=>setSelected(null)} className="text-sm underline hover:text-primary">Close</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="font-semibold text-muted-foreground text-xs mb-2">Customer Details</div>
                <div className="space-y-1">
                  <div><span className="font-medium">Name:</span> {selected?.customer?.name || "Guest"}</div>
                  <div><span className="font-medium">Email:</span> {selected?.customer?.email}</div>
                  <div><span className="font-medium">WhatsApp:</span> {selected?.customer?.whatsapp}</div>
                </div>
              </div>
              <div><span className="text-muted-foreground">Created:</span> <span className="font-medium">{new Date(selected.createdAt).toLocaleString()}</span></div>
              <div className="pt-3 border-t">
                <div className="font-semibold text-muted-foreground text-xs mb-2">Items</div>
                <ul className="space-y-2">
                  {selected.items?.map((it:any)=> (
                    <li key={it.id+it.qty} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="font-medium">{it.id}</span>
                      <span className="text-muted-foreground">Qty: {it.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {section === "dashboard" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                <ShoppingCart className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
                <Package className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">In catalog</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
                <Users className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique emails</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Growth</CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+{metrics.growthPercentage}%</div>
                <p className="text-xs text-muted-foreground mt-1">Recent activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Orders will appear here once customers start purchasing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((o) => (
                    <div 
                      key={o.code} 
                      className="p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={()=>setSelected(o)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{o?.customer?.name || "Guest"}</div>
                            <div className="font-mono text-xs text-muted-foreground">#{o.code}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground hidden sm:block">{new Date(o.createdAt).toLocaleDateString()}</span>
                          <div className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                            {o.items?.length || 0} items
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Lookup */}
          <OrderLookup token={token} />
        </div>
      )}
      {section === "products" && <ProductsManager token={token} />}
      {section === "categories" && <CategoriesManager />}
      {section === "banners" && <BannersManager token={token} />}
      {section === "promos" && <PromosManager token={token} />}
      {section === "settings" && <SettingsPane token={token} />}
    </AdminShell>
  );
}
