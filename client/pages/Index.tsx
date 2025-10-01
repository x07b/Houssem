import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/layout/Layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/context/ProductsContext";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";
import {
  Gift,
  Gamepad2,
  Monitor,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

const banners = [
  {
    id: "gift-cards",
    image:
      "https://images.pexels.com/photos/3945673/pexels-photo-3945673.jpeg?auto=compress&cs=tinysrgb&w=1600",
    headingKey: "banner_gift_cards_heading" as const,
    bodyKey: "banner_gift_cards_body" as const,
    ctaKey: "banner_gift_cards_cta" as const,
    href: "/#featured",
  },
  {
    id: "console-gear",
    image:
      "https://images.pexels.com/photos/4520791/pexels-photo-4520791.jpeg?auto=compress&cs=tinysrgb&w=1600",
    headingKey: "banner_console_heading" as const,
    bodyKey: "banner_console_body" as const,
    ctaKey: "banner_console_cta" as const,
    href: "/#new",
  },
] satisfies Array<{
  id: string;
  image: string;
  headingKey: string;
  bodyKey: string;
  ctaKey: string;
  href: string;
}>;

const categories = [
  {
    id: "cards",
    titleKey: "category_gift_cards_title" as const,
    bodyKey: "category_gift_cards_body" as const,
    icon: Gift,
    accent: "from-emerald-500/80 to-lime-400/70",
  },
  {
    id: "console",
    titleKey: "category_console_title" as const,
    bodyKey: "category_console_body" as const,
    icon: Gamepad2,
    accent: "from-blue-500/80 to-cyan-400/70",
  },
  {
    id: "pc",
    titleKey: "category_pc_title" as const,
    bodyKey: "category_pc_body" as const,
    icon: Monitor,
    accent: "from-purple-500/75 to-indigo-400/70",
  },
  {
    id: "esports",
    titleKey: "category_esports_title" as const,
    bodyKey: "category_esports_body" as const,
    icon: Trophy,
    accent: "from-amber-500/80 to-orange-400/70",
  },
] satisfies Array<{
  id: string;
  titleKey: string;
  bodyKey: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: string;
}>;

export default function Index() {
  const { t } = useI18n();
  const { products } = useProducts();

  return (
    <Layout>
      <div className="space-y-16 pb-16">
        <section className="space-y-6">
          <HeroCarousel />
          <div className="grid gap-4 lg:grid-cols-2">
            {banners.map((banner) => (
              <article
                key={banner.id}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={banner.image}
                  alt={t(banner.headingKey)}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40 dark:from-black/85 dark:via-black/55" />
                <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                      {t("instant_email")}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                      {t(banner.headingKey)}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm text-white/80 sm:text-base">
                      {t(banner.bodyKey)}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="mt-6 w-fit bg-white text-gray-900 hover:bg-white/90"
                  >
                    <Link to={banner.href}>{t(banner.ctaKey)}</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="categories" className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("categories")}
            </h2>
            <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {t("promo_instant")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map(({ id, titleKey, bodyKey, icon: Icon, accent }) => (
              <div
                key={id}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                <div
                  className={cn(
                    "mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                    accent,
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold sm:text-xl">{t(titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(bodyKey)}</p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            ))}
          </div>
        </section>

        <section id="featured" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("hottest_deals")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("limited_time_tag")}
              </p>
            </div>
            <Button asChild size="lg" variant="outline">
              <Link to="/#categories">{t("hero_cta_secondary")}</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
                {t("empty_cart")}
              </div>
            ) : (
              products.map((product) => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </section>

        <section id="new" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("new_and_upcoming")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("new_and_upcoming_tag")}
              </p>
            </div>
            <Button asChild size="lg" variant="ghost">
              <Link to="/products/new">{t("view_details")}</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
                {t("empty_cart")}
              </div>
            ) : (
              products.map((product) => <ProductCard key={`new-${product.id}`} product={product} />)
            )}
          </div>
        </section>

        <section id="newsletter" className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/7915365/pexels-photo-7915365.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Players celebrating a win"
              loading="lazy"
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/30 dark:from-black/85" />
          </div>
          <div className="relative z-10 grid gap-8 p-8 sm:p-12 lg:grid-cols-[2fr,1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
                {t("promo_instant")}
              </p>
              <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                {t("newsletter_cta_heading")}
              </h3>
              <p className="mt-3 max-w-lg text-sm text-white/80 sm:text-base">
                {t("newsletter_cta_body")}
              </p>
            </div>
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input
                type="email"
                placeholder={t("newsletter_placeholder")}
                className="h-12 rounded-2xl border border-white/30 bg-white/10 text-white placeholder:text-white/60 backdrop-blur"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground"
              >
                {t("newsletter_cta_action")}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </Layout>
  );
}
