import Layout from "@/components/layout/Layout";
import { useSearchParams, Link } from "react-router-dom";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const code = params.get("code");
  return (
    <Layout>
      <div className="max-w-xl mx-auto text-center py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold">Order placed</h1>
        <p className="mt-2 text-muted-foreground">{code ? `Panier ${code} created. Check your email for details.` : "Check your email for details."}</p>
        <div className="mt-6">
          <Link className="underline" to="/">Back to home</Link>
        </div>
      </div>
    </Layout>
  );
}
