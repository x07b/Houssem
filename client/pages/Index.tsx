import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/layout/Layout";
import { useProducts } from "@/context/ProductsContext";
import { Gift, CreditCard } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

export default function Index() {
  const { t } = useI18n();
  const { products } = useProducts();

  return (
    <Layout>
      <HeroCarousel />

      <section id="featured" className="mt-10 md:mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold">Hottest Deals</h2>
          <span className="text-sm text-primary">Limited time</span>
        </div>

        <Filters />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border bg-card p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold">Join Premium – Pay Less, Gain More</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Extra discounts on top deals</li>
            <li>• Early access to new drops</li>
            <li>• Priority email delivery</li>
          </ul>
        </div>
        <div className="justify-self-end">
          <a href="#" className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold shadow hover:opacity-90">Start 7‑day trial</a>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="relative rounded-2xl overflow-hidden h-44 md:h-56">
          <img src="https://images.pexels.com/photos/5625120/pexels-photo-5625120.jpeg?auto=compress&cs=tinysrgb&w=1200" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 p-6 flex items-end">
            <p className="text-white text-lg md:text-2xl font-bold">Use code XYZ to save 20% today</p>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden h-44 md:h-56">
          <img src="https://images.pexels.com/photos/33797245/pexels-photo-33797245.jpeg?auto=compress&cs=tinysrgb&w=1200" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
          <div className="absolute inset-0 p-6 flex items-end">
            <p className="text-white text-lg md:text-2xl font-bold">{t("promo_instant")}</p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl md:text-3xl font-extrabold">{t("categories")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl p-6 border bg-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20" />
            <div>
              <p className="font-semibold">Subscriptions</p>
              <p className="text-sm text-muted-foreground">Netflix, Spotify</p>
            </div>
          </div>
          <div className="rounded-xl p-6 border bg-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20" />
            <div>
              <p className="font-semibold">Gift Cards</p>
              <p className="text-sm text-muted-foreground">Steam, PSN, Xbox</p>
            </div>
          </div>
          <div className="rounded-xl p-6 border bg-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20" />
            <div>
              <p className="font-semibold">Software</p>
              <p className="text-sm text-muted-foreground">Windows, Office</p>
            </div>
          </div>
          <div className="rounded-xl p-6 border bg-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20" />
            <div>
              <p className="font-semibold">Games</p>
              <p className="text-sm text-muted-foreground">PC & Console</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl md:text-3xl font-extrabold">New & Upcoming</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={`new-` + p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold">Get 10% off your first purchase</h3>
            <p className="text-sm text-muted-foreground">Subscribe to our newsletter</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input className="flex-1 md:w-80 rounded-2xl border bg-background px-4 py-2" placeholder="Email address" />
            <button type="button" className="rounded-2xl bg-primary text-primary-foreground px-5 font-semibold">Subscribe</button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
