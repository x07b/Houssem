import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useI18n } from "@/context/I18nContext";
import { useProducts } from "@/context/ProductsContext";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

  function validateEmail(v: string) {
    return /.+@.+\..+/.test(v);
  }
  function validatePhone(v: string) {
    return /^\+?[0-9 ()-]{6,}$/.test(v);
  }

  const [errors, setErrors] = useState<{name?:string; email?:string; whatsapp?:string}>({});
  function validateAll() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Full name is required.";
    if (!validateEmail(email)) e.email = "Please enter a valid email address.";
    if (!validatePhone(whatsapp)) e.whatsapp = "Please enter a valid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    if (!validateAll()) {
      toast.error("Please fix the errors above.");
      return;
    }
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
      toast.success("Order placed! Check your email.", { description: `Panier ${data.code}`, action: { label: "View order", onClick: ()=> window.location.assign(`/order-success?code=${data.code}`) } });
      clear();
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
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
            <div>
              <input className="rounded border px-3 py-2 bg-background w-full" placeholder={t("fullname")} value={name} onChange={(e)=>setName(e.target.value)} onBlur={()=>{ if(!name.trim()) setErrors((p)=>({...p, name: "Full name is required."})); else setErrors((p)=>({...p, name: undefined})); }} aria-invalid={!!errors.name} aria-describedby={errors.name?"err-name":undefined} />
              {errors.name && <p id="err-name" className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <input className="rounded border px-3 py-2 bg-background w-full" placeholder={t("email")} value={email} onChange={(e)=>setEmail(e.target.value)} onBlur={()=>{ if(!/.+@.+\..+/.test(email)) setErrors((p)=>({...p, email: "Please enter a valid email address."})); else setErrors((p)=>({...p, email: undefined})); }} aria-invalid={!!errors.email} aria-describedby={errors.email?"err-email":undefined} />
              {errors.email && <p id="err-email" className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <input className="rounded border px-3 py-2 bg-background w-full" placeholder={t("whatsapp")} value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} onBlur={()=>{ if(!/^\+?[0-9 ()-]{6,}$/.test(whatsapp)) setErrors((p)=>({...p, whatsapp: "Please enter a valid phone number."})); else setErrors((p)=>({...p, whatsapp: undefined})); }} aria-invalid={!!errors.whatsapp} aria-describedby={errors.whatsapp?"err-phone":undefined} />
              {errors.whatsapp && <p id="err-phone" className="text-sm text-red-500 mt-1">{errors.whatsapp}</p>}
            </div>
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
            <button disabled={loading || list.length===0} onClick={placeOrder} className="rounded-2xl bg-primary text-primary-foreground px-5 py-2 font-semibold disabled:opacity-50 inline-flex items-center gap-2">
              {loading && <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" aria-hidden="true" />}
              {t("place_order")}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
