import Layout from "@/components/layout/Layout";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) navigate("/admin"); else alert("Invalid credentials");
  }

  return (
    <Layout>
      <div className="max-w-sm mx-auto border rounded-2xl p-6 mt-10">
        <h1 className="text-xl font-bold">Admin Login</h1>
        <form className="grid gap-3 mt-4" onSubmit={submit}>
          <input className="rounded border px-3 py-2 bg-background" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input type="password" className="rounded border px-3 py-2 bg-background" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button disabled={loading} className="rounded-2xl bg-primary text-primary-foreground px-5 py-2 font-semibold disabled:opacity-50" type="submit">Login</button>
        </form>
      </div>
    </Layout>
  );
}
