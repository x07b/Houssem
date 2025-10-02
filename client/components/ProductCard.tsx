import { AdminProduct } from "@shared/entities";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { slugify } from "@/lib/utils";

function getBadgeLabel(product: AdminProduct, t: (key: string) => string) {
  if (typeof product.discountPercent === "number" && product.discountPercent > 0) {
    return `${product.discountPercent}% OFF`;
  }
  if ((product as any)?.tagline) return String((product as any).tagline);
  return t("promo_instant");
}

export default function ProductCard({ product }: { product: AdminProduct }) {
  const { format } = useCurrency();
  const { t } = useI18n();
  const { add } = useCart();

  return (
    <motion.article
      whileHover={{ y: -12 }}
      transition={{ duration: 0.3 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-[box-shadow,border] hover:border-primary/40 hover:shadow-2xl"
    >
      <Link to={`/product/${(product as any).slug || slugify(product.title || product.id)}`} className="relative block overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {((product as any)?.category || (product as any)?.platform) && (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {(product as any)?.platform || (product as any)?.category}
          </span>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <h3 className="max-w-[70%] text-lg font-semibold leading-snug line-clamp-2">
            {product.title}
          </h3>
          <span className="rounded-lg bg-white/15 px-3 py-1 text-sm font-semibold">
            {format(product.price.USD)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{t("delivery_method")}</span>
          <span className="text-right">{t("supported_currencies")}</span>
        </div>
        <div className="mt-auto flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary",
              "shadow-sm shadow-primary/20",
            )}
          >
            {getBadgeLabel(product, t)}
          </span>
          <Button
            size="lg"
            className="flex-1 rounded-xl text-sm font-semibold shadow-lg shadow-primary/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-primary/40"
            onClick={() => add(product.id)}
          >
            <ShoppingCart className="size-4" />
            {t("add_to_cart")}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
