import { useI18n } from "@/context/I18nContext";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { ShoppingCart, Globe, Coins, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useThemeMode } from "@/context/ThemeContext";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { currency, setCurrency, format } = useCurrency();
  const { items } = useCart();
  const navigate = useNavigate();
  const { theme, toggle } = useThemeMode();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <div className="container px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={theme === "dark"
                ? "https://cdn.builder.io/api/v1/image/assets%2Fe4359f63018e41f4b5c3ebff8141a6d7%2Feceee5aa4bb943ce86875a5482e4b031?format=webp&width=200"
                : "https://cdn.builder.io/api/v1/image/assets%2Fe4359f63018e41f4b5c3ebff8141a6d7%2F7c517b64d058453096f8d1968f2024d6?format=webp&width=200"}
              alt="UPORA Digital Solutions"
              className="h-8 md:h-9 w-auto"
            />
          </Link>
          <button className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            {t("nav_categories")}
          </button>

          <div className="hidden md:flex flex-1 mx-4">
            <input
              className="w-full rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search games, gift cards..."
              aria-label="Search"
            />
          </div>

          <ul className="hidden md:flex items-center gap-6 ml-4 text-sm text-muted-foreground">
            <li><Link to="/?cat=gaming" className="hover:text-foreground flex items-center gap-2">{t("nav_gaming")}</Link></li>
            <li><Link to="/?cat=software" className="hover:text-foreground flex items-center gap-2">{t("nav_software")}</Link></li>
            <li><Link to="/?cat=subscriptions" className="hover:text-foreground flex items-center gap-2">{t("nav_subscriptions")}</Link></li>
            <li><Link to="/?cat=giftcards" className="hover:text-foreground flex items-center gap-2">{t("nav_giftcards")}</Link></li>
            <li><Link to="/?cat=bestsellers" className="hover:text-foreground flex items-center gap-2">{t("nav_bestsellers")}</Link></li>
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-muted" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          </button>
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-muted"
            aria-label="Toggle theme"
            onClick={() => toggle()}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

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
