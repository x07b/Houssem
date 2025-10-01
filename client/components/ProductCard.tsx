import { AdminProduct } from "@shared/entities";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useI18n } from "@/context/I18nContext";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

export default function ProductCard({ product }: { product: AdminProduct }) {
  const { format } = useCurrency();
  const { t } = useI18n();
  const { add } = useCart();

  return (
    <motion.div whileHover={{ y: -6 }} className="group rounded-xl bg-card border shadow-sm overflow-hidden">
      <Link to={`/product/${product.id}`} className="block relative">
        <img src={product.image} alt={product.title} className="h-44 md:h-56 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
        {((product as any)?.category || (product as any)?.platform) && (
          <span className="absolute left-2 top-2 text-[11px] px-2 py-1 rounded-full bg-background/80 backdrop-blur border text-foreground">
            {(product as any)?.platform || (product as any)?.category}
          </span>
        )}
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-base md:text-lg line-clamp-1">{product.title}</h3>
          <span className="text-primary font-bold">{format(product.price.USD)}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent-foreground min-w-10 text-center">
            {product.discountPercent ? `-${product.discountPercent}%` : "Deal"}
          </span>
          <Button size="sm" onClick={() => add(product.id)} className="shadow-sm">{t("add_to_cart")}</Button>
        </div>
      </div>
    </motion.div>
  );
}
