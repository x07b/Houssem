import { useI18n } from "@/context/I18nContext";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { ShoppingCart, Globe, Coins } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { currency, setCurrency, format } = useCurrency();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <div className="container px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F1ca0949e89764f508ab3c74fe08ee0a0%2Fbc21065acefb4a3b933344097f0ed0a3?format=webp&width=200"
              alt="UPORA Digital Solutions"
              className="h-8 md:h-9 w-auto"
            />
          </Link>
          <button className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            {t("nav_categories")}
          </button>
          <ul className="hidden md:flex items-center gap-6 ml-4 text-sm text-muted-foreground">
            <li><Link to="/?cat=gaming" className="hover:text-foreground flex items-center gap-2">{t("nav_gaming")}</Link></li>
            <li><Link to="/?cat=software" className="hover:text-foreground flex items-center gap-2">{t("nav_software")}</Link></li>
            <li><Link to="/?cat=subscriptions" className="hover:text-foreground flex items-center gap-2">{t("nav_subscriptions")}</Link></li>
            <li><Link to="/?cat=giftcards" className="hover:text-foreground flex items-center gap-2">{t("nav_giftcards")}</Link></li>
            <li><Link to="/?cat=bestsellers" className="hover:text-foreground flex items-center gap-2">{t("nav_bestsellers")}</Link></li>
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="w-4 h-4" />
            <select
              className="bg-transparent outline-none"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label={t("nav_currency")}
            >
              <option value="USD">USD</option>
              <option value="TND">TND</option>
              <option value="EGP">EGP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <select
              className="bg-transparent outline-none"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              aria-label={t("nav_language")}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <button onClick={() => navigate("/checkout")} className="relative inline-flex items-center">
            <ShoppingCart className="w-6 h-6 text-foreground" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
