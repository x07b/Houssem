import Layout from "@/components/layout/Layout";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AdminProduct } from "@shared/entities";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useI18n } from "@/context/I18nContext";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const { add } = useCart();
  const { format } = useCurrency();
  const { t } = useI18n();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`).then(r=> r.ok ? r.json() : null).then(setProduct).catch(()=>setProduct(null));
  }, [id]);

  const priceUSD = useMemo(()=> product?.price?.USD ?? 0, [product]);

  if (!product) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {product.image && (
            <img src={product.image} alt={product.title} className="w-full rounded-xl border object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{product.title}</h1>
          <div className="mt-2 text-primary font-bold text-xl">{format(priceUSD)}</div>
          <p className="mt-4 text-muted-foreground">{product.description}</p>
          <div className="mt-6">
            <Button onClick={()=> add(product.id)}>{t("add_to_cart")}</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
