import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRef, useState } from "react";
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
  const timerRef = useRef<number | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || timerRef.current) return;
    setSubmitting(true);
    setError(null);
    timerRef.current = window.setTimeout(async () => {
      try {
        const ok = await login(username, password);
        if (!ok) {
          setError("Invalid username or password.");
          return;
        }
        navigate("/admin");
      } finally {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setSubmitting(false);
      }
    }, 300);
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
