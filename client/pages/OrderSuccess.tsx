import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const [order, setOrder] = useState<any | null>(null);
  useEffect(() => {
    if (!code) return;
    fetch(`/api/orders/${encodeURIComponent(code)}`).then(r=>r.json()).then(setOrder).catch(()=>setOrder(null));
  }, [code]);
  return (
    <Layout>
      <div className="max-w-xl mx-auto text-center py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold">Thank you!</h1>
        <p className="mt-2 text-muted-foreground">
          {code ? (
            <>Order <span className="font-mono">{code}</span>{order?.customer?.name ? <> for <span className="font-semibold">{order.customer.name}</span></> : null} created.</>
          ) : (
            "Check your email for details."
          )}
        </p>
        <div className="mt-6">
          <Link className="underline" to="/">Back to store</Link>
        </div>
      </div>
    </Layout>
  );
}
