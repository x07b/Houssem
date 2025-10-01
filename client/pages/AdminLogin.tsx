import { useAdminAuth } from "@/context/AdminAuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const ok = await login(username, password);
    setSubmitting(false);
    if (!ok) {
      setError("Invalid username or password.");
      return;
    }
    navigate("/admin");
  };

  return (
    <Layout>
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-extrabold">Admin Login</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <input
              placeholder="Username"
              className="w-full rounded-2xl border bg-background px-4 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-2xl border bg-background px-4 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "password-error" : undefined}
            />
            {error && <p id="password-error" className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <Button type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Login"}</Button>
        </form>
      </div>
    </Layout>
  );
}
