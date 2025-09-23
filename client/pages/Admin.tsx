import Layout from "@/components/layout/Layout";
import AdminShell, { AdminSection } from "@/components/admin/AdminShell";
import ProductsManager from "@/components/admin/ProductsManager";
import BannersManager from "@/components/admin/BannersManager";
import PromosManager from "@/components/admin/PromosManager";
import SettingsPane from "@/components/admin/SettingsPane";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { token, logout } = useAdminAuth();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  if (!token) return null;

  return (
    <Layout>
      <AdminShell
        section={section}
        onSelect={setSection}
        headerRight={<button onClick={logout} className="text-sm underline">Logout</button>}
      >
        {section === "dashboard" && (
          <div className="grid gap-3">
            <div className="border rounded-2xl p-4">Welcome to the admin dashboard.</div>
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
