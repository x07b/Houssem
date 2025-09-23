import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AdminAuth {
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const Ctx = createContext<AdminAuth | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));

  useEffect(() => {
    if (token) localStorage.setItem("admin_token", token); else localStorage.removeItem("admin_token");
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (!res.ok) return false;
    const data = await res.json();
    setToken(data.token);
    return true;
  };

  const logout = () => setToken(null);

  const value = useMemo(() => ({ token, login, logout }), [token]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
