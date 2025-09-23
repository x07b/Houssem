import Layout from "@/components/layout/Layout";
import { useSearchParams } from "react-router-dom";

export default function OrderSuccess() {
  const [sp] = useSearchParams();
  const code = sp.get("code");
  return (
    <Layout>
      <div className="py-16 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold">Order placed</h1>
        <p className="mt-2 text-muted-foreground">Panier {code}</p>
        <p className="mt-4">Check your email for confirmation and next steps.</p>
      </div>
    </Layout>
  );
}
