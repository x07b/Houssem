import { useI18n } from "@/context/I18nContext";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { ShoppingCart, Globe, Coins, Moon, Sun, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useThemeMode } from "@/context/ThemeContext";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const { items } = useCart();
  const navigate = useNavigate();
  const { theme, toggle } = useThemeMode();

  const navLinks = [
    { to: "/?cat=gaming", label: t("nav_gaming") },
    { to: "/?cat=software", label: t("nav_software") },
    { to: "/?cat=subscriptions", label: t("nav_subscriptions") },
    { to: "/?cat=giftcards", label: t("nav_giftcards") },
    { to: "/?cat=bestsellers", label: t("nav_bestsellers") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex flex-1 items-center gap-4 md:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-0 sm:max-w-sm">
              <div className="flex h-full flex-col">
                <div className="px-6 pt-6 pb-4">
                  <SheetClose asChild>
                    <Link to="/" className="flex items-center gap-2">
                      <img
                        src={
                          theme === "dark"
                            ? "https://cdn.builder.io/api/v1/image/assets%2Fe4359f63018e41f4b5c3ebff8141a6d7%2Feceee5aa4bb943ce86875a5482e4b031?format=webp&width=200"
                            : "https://cdn.builder.io/api/v1/image/assets%2Fe4359f63018e41f4b5c3ebff8141a6d7%2F7c517b64d058453096f8d1968f2024d6?format=webp&width=200"
                        }
                        alt="UPORA Digital Solutions"
                        className="h-8 w-auto"
                      />
                    </Link>
                  </SheetClose>
                </div>
                <div className="px-6 pb-4">
                  <input
                    className="w-full rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Search games, gift cards..."
                    aria-label="Search"
                  />
                </div>
                <nav className="flex-1 overflow-y-auto px-6 pb-6">
                  <ul className="space-y-2 text-sm text-foreground">
                    {navLinks.map((item) => (
                      <li key={item.to}>
                        <SheetClose asChild>
                          <Link
                            to={item.to}
                            className="flex items-center justify-between rounded-md px-3 py-2 font-medium hover:bg-muted"
                          >
                            {item.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="space-y-4 border-t px-6 py-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      <span>{t("nav_currency")}</span>
                    </div>
                    <select
                      className="bg-transparent text-foreground outline-none"
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
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{t("nav_language")}</span>
                    </div>
                    <select
                      className="bg-transparent text-foreground outline-none"
                      value={lang}
                      onChange={(e) => setLang(e.target.value as any)}
                      aria-label={t("nav_language")}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <img
              src={
                theme === "dark"
                  ? "https://cdn.builder.io/api/v1/image/assets%2Fe4359f63018e41f4b5c3ebff8141a6d7%2Feceee5aa4bb943ce86875a5482e4b031?format=webp&width=200"
                  : "https://cdn.builder.io/api/v1/image/assets%2Fe4359f63018e41f4b5c3ebff8141a6d7%2F7c517b64d058453096f8d1968f2024d6?format=webp&width=200"
              }
              alt="UPORA Digital Solutions"
              className="h-8 w-auto md:h-9"
            />
          </Link>

          <button className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex md:items-center md:gap-2">
            {t("nav_categories")}
          </button>

          <div className="hidden flex-1 md:flex md:mx-4">
            <input
              className="w-full rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search games, gift cards..."
              aria-label="Search"
            />
          </div>

          <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex md:ml-4">
            {navLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-2 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted md:hidden"
            aria-label="Search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </button>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted"
            aria-label="Toggle theme"
            onClick={() => toggle()}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <Coins className="h-4 w-4" />
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

          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <Globe className="h-4 w-4" />
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

          <button
            onClick={() => navigate("/checkout")}
            className="relative inline-flex items-center"
          >
            <ShoppingCart className="h-6 w-6 text-foreground" />
            {items.length > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
