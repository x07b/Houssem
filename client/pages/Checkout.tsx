import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useI18n } from "@/context/I18nContext";
import { useProducts } from "@/context/ProductsContext";
import { useMemo, useState } from "react";

export default function Checkout() {
  const { items, remove, clear, totalUSD } = useCart();
  const { productsById } = useProducts();
  const { format } = useCurrency();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [currency, setCurrency] = useState<"USD"|"TND"|"EGP"|"EUR">("USD");
  const [promoCode, setPromoCode] = useState("");
  const [result, setResult] = useState<{ code: string; whatsapp: string | null; emailSent: boolean }|null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const list = useMemo(()=> items.map(it=> ({ ...it, product: productsById[it.id] })), [items, productsById]);

  async function placeOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp, currency, items, promoCode: promoCode || undefined, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Checkout failed");
      setResult(data);
      clear();
    } catch (e) {
      console.error(e);
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl md:text-3xl font-extrabold">{t("checkout")}</h1>

      {result ? (
        <div className="mt-6 border rounded-2xl p-4">
          <div className="font-semibold">Order {result.code}</div>
          <div className="text-sm text-muted-foreground mt-1">{result.emailSent ? t("order_success") : t("order_success_no_email")}</div>
          {result.whatsapp && (
            <div className="mt-2 text-sm">WhatsApp: {result.whatsapp}</div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="border rounded-2xl p-4">
            <h2 className="font-semibold mb-3">{t("step_cart")}</h2>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty_cart")}</p>
            ) : (
              <div className="grid gap-3">
                {list.map((it)=> (
                  <div key={it.id} className="flex items-center gap-3">
                    {it.product?.image && <img src={it.product.image} alt="" className="h-12 w-12 rounded object-cover" />}
                    <div className="flex-1">
                      <div className="font-medium">{it.product?.title}</div>
                      <div className="text-xs text-muted-foreground">x{it.qty}</div>
                    </div>
                    <button className="text-sm text-destructive" onClick={()=>remove(it.id)}>{t("remove")}</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 font-semibold">{t("total_label")}: {format(totalUSD)}</div>
          </div>

          <div className="border rounded-2xl p-4 grid gap-3">
            <h2 className="font-semibold">{t("step_details")}</h2>
            <input className="rounded border px-3 py-2 bg-background" placeholder={t("fullname")} value={name} onChange={(e)=>setName(e.target.value)} />
            <input className="rounded border px-3 py-2 bg-background" placeholder={t("email")} value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="rounded border px-3 py-2 bg-background" placeholder={t("whatsapp")} value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} />
            <textarea className="rounded border px-3 py-2 bg-background min-h-[80px]" placeholder="Additional notes (optional)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
            <select className="rounded border px-3 py-2 bg-background" value={currency} onChange={(e)=>setCurrency(e.target.value as any)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="TND">TND</option>
              <option value="EGP">EGP</option>
            </select>
            <div className="flex gap-2 items-center">
              <input className="rounded border px-3 py-2 bg-background flex-1" placeholder={t("promo_code")} value={promoCode} onChange={(e)=>setPromoCode(e.target.value)} />
              <button className="rounded-2xl bg-muted px-3 py-2" type="button">{t("apply")}</button>
            </div>
            <button disabled={loading || list.length===0} onClick={placeOrder} className="rounded-2xl bg-primary text-primary-foreground px-5 py-2 font-semibold disabled:opacity-50">
              {t("place_order")}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
