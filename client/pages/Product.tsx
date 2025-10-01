import Layout from "@/components/layout/Layout";
import { useParams } from "react-router-dom";
import { useProducts } from "@/context/ProductsContext";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function ProductPage() {
  const { id } = useParams();
  const { productsById } = useProducts();
  const { add } = useCart();
  const p = id ? productsById[id] : undefined;
  if (!p) return (
    <Layout>
      <div className="py-10">Product not found.</div>
    </Layout>
  );
  return (
    <Layout>
      <div className="grid gap-6 md:grid-cols-2">
        {p.image && <img src={p.image} alt={p.title} className="w-full rounded-2xl object-cover" />}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{p.title}</h1>
          <p className="mt-2 text-muted-foreground">{p.description}</p>
          <div className="mt-6">
            <Button onClick={() => add(p.id)}>Add to Cart</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
