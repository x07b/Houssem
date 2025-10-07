import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Schema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .min(6, "Please enter a valid phone number.")
    .refine((v) => /^(\+)?[0-9 ()\-]{6,}$/.test(v), "Please enter a valid phone number."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof Schema>;

export default function Checkout() {
  const { items, remove, add, clear } = useCart();
  const { productsById } = useProducts();
  const { currency, format } = useCurrency();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, it) => sum + (productsById[it.id]?.price?.USD || 0) * it.qty, 0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(Schema), mode: "onBlur" });

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty. Browse deals.");
      return;
    }

    const payload = {
      name: data.fullName,
      email: data.email,
      whatsapp: data.phone,
      currency: currency,
      items: items.map((it) => ({ id: it.id, qty: it.qty })),
      promoCode: undefined as string | undefined,
      notes: data.notes,
      subtotal,
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    const json = await res.json();
    const code = json.panierCode as string;
    clear();
    toast.success("Order placed! Check your email for confirmation.", {
      description: `Panier ${code} created. Check your email for details.`,
      action: {
        label: "View order",
        onClick: () => navigate(`/order-success?code=${encodeURIComponent(code)}`),
      },
    });
    navigate(`/order-success?code=${encodeURIComponent(code)}`);
  };

  return (
    <Layout>
      <h1 className="text-2xl md:text-3xl font-extrabold">Checkout</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="border rounded-2xl p-4 bg-card">
          <h2 className="font-semibold mb-3">Cart</h2>
          {items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold">Your cart is empty</p>
              <div className="mt-3">
                <Button asChild>
                  <a href="/">Continue shopping</a>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => {
                const p = productsById[it.id];
                if (!p) return null;
                return (
                  <li key={it.id} className="flex items-center gap-3">
                    {p.image && <img src={p.image} alt={p.title} className="w-14 h-14 rounded object-cover" />}
                    <div className="flex-1">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{format(p.price.USD)} × {it.qty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => add(it.id, -1)} aria-label="Decrease quantity">-</Button>
                      <span className="w-6 text-center">{it.qty}</span>
                      <Button size="sm" variant="outline" onClick={() => add(it.id, 1)} aria-label="Increase quantity">+</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(it.id)}>Remove</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between font-semibold">
            <span>Subtotal</span>
            <span>{format(subtotal)}</span>
          </div>
        </section>

        <section className="border rounded-2xl p-4 bg-card">
          <h2 className="font-semibold mb-3">Your details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div>
              <input
                {...register("fullName")}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className="w-full rounded-2xl border bg-background px-4 py-2"
                placeholder="Full Name"
              />
              {errors.fullName && <p id="fullName-error" className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div>
              <input
                {...register("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full rounded-2xl border bg-background px-4 py-2"
                placeholder="Email"
                type="email"
              />
              {errors.email && <p id="email-error" className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register("phone")}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className="w-full rounded-2xl border bg-background px-4 py-2"
                placeholder="Phone Number"
              />
              {errors.phone && <p id="phone-error" className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <textarea
                {...register("notes")}
                className="w-full rounded-2xl border bg-background px-4 py-2 min-h-28"
                placeholder="Notes (optional)"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="justify-center">
              {isSubmitting ? "Placing..." : "Place Order"}
            </Button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
