import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface LoginResult { ok: boolean; error?: string }
interface AdminAuth {
  token: string | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const Ctx = createContext<AdminAuth | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));

  useEffect(() => {
    if (token) localStorage.setItem("admin_token", token); else localStorage.removeItem("admin_token");
  }, [token]);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || "Invalid username or password" };
      }
      setToken("ok");
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Network error" };
    }
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
