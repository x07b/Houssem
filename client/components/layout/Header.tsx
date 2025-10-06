import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/context/I18nContext";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useThemeMode } from "@/context/ThemeContext";
import { useProducts } from "@/context/ProductsContext";
import SearchModal from "./SearchModal";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Globe,
  Coins,
  Moon,
  Sun,
  Menu,
  Search,
  Languages,
  Check,
} from "lucide-react";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { currency, setCurrency, format } = useCurrency();
  const { items } = useCart();
  const navigate = useNavigate();
  const { theme, toggle } = useThemeMode();
  const { products } = useProducts();

  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLangOpenDesktop, setIsLangOpenDesktop] = useState(false);
  const [isLangOpenMobile, setIsLangOpenMobile] = useState(false);

  const navLinks = [
    { to: "/?cat=gaming", label: t("nav_gaming") },
    { to: "/?cat=software", label: t("nav_software") },
    { to: "/?cat=subscriptions", label: t("nav_subscriptions") },
    { to: "/?cat=giftcards", label: t("nav_giftcards") },
    { to: "/?cat=bestsellers", label: t("nav_bestsellers") },
  ];

  const suggestions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const source = term
      ? products.filter((product) =>
          product.title.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term),
        )
      : products;
    return source.slice(0, 8);
  }, [products, searchTerm]);

  const handleNavigate = (id: string) => {
    setSearchOpen(false);
    setSearchTerm("");
    navigate(`/product/${id}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex flex-1 items-center gap-3 md:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-0 sm:max-w-sm">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4">
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
                  <div className="flex items-center gap-3">
                    <SheetClose asChild>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-11 w-11 rounded-full [&_svg]:size-5"
                              aria-label={t("nav_search") || "Search"}
                              onClick={() => setSearchOpen(true)}
                            >
                              <Search />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Search</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SheetClose>

                    <TooltipProvider>
                      <Tooltip>
                        <DropdownMenu open={isLangOpenMobile} onOpenChange={setIsLangOpenMobile}>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-11 w-11 rounded-full [&_svg]:size-5"
                                aria-label="Language"
                                aria-haspopup="menu"
                                aria-expanded={isLangOpenMobile}
                              >
                                <Languages />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Language</TooltipContent>
                          <DropdownMenuContent sideOffset={8} align="end" className="w-56 p-1">
                            <DropdownMenuItem
                              role="menuitem"
                              className="flex h-11 items-center justify-between rounded-md px-3"
                              onSelect={() => setLang("en")}
                              aria-current={lang === "en"}
                            >
                              English
                              {lang === "en" && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              role="menuitem"
                              className="flex h-11 items-center justify-between rounded-md px-3"
                              onSelect={() => setLang("fr")}
                              aria-current={lang === "fr"}
                            >
                              French
                              {lang === "fr" && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              role="menuitem"
                              className="flex h-11 items-center justify-between rounded-md px-3"
                              onSelect={() => setLang("ar")}
                              aria-current={lang === "ar"}
                            >
                              Arabic
                              {lang === "ar" && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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

          <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {navLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-2 font-medium hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-full [&_svg]:size-5"
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Search</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <DropdownMenu open={isLangOpenDesktop} onOpenChange={setIsLangOpenDesktop}>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-full [&_svg]:size-5"
                      aria-label="Language"
                      aria-haspopup="menu"
                      aria-expanded={isLangOpenDesktop}
                    >
                      <Languages />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Language</TooltipContent>
                <DropdownMenuContent sideOffset={8} align="end" className="w-56 p-1">
                  <DropdownMenuItem
                    role="menuitem"
                    className="flex h-11 items-center justify-between rounded-md px-3"
                    onSelect={() => setLang("en")}
                    aria-current={lang === "en"}
                  >
                    English
                    {lang === "en" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    role="menuitem"
                    className="flex h-11 items-center justify-between rounded-md px-3"
                    onSelect={() => setLang("fr")}
                    aria-current={lang === "fr"}
                  >
                    French
                    {lang === "fr" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    role="menuitem"
                    className="flex h-11 items-center justify-between rounded-md px-3"
                    onSelect={() => setLang("ar")}
                    aria-current={lang === "ar"}
                  >
                    Arabic
                    {lang === "ar" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-full [&_svg]:size-5"
                  aria-label="Theme"
                  onClick={() => toggle()}
                >
                  {theme === "dark" ? <Sun /> : <Moon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-11 w-11 rounded-full [&_svg]:size-5"
                  aria-label="Cart"
                  onClick={() => navigate("/checkout")}
                >
                  <ShoppingCart />
                  {items.length > 0 && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                      {items.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Cart</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <CommandDialog
        open={isSearchOpen}
        title={t("nav_search") || "Search products"}
        description={t("nav_search_hint") || "Start typing to see suggestions"}
        onOpenChange={(open) => {
          setSearchOpen(open);
          if (!open) {
            setSearchTerm("");
          }
        }}
      >
        <div className="border-b bg-background/80 px-4 py-3 text-sm font-semibold text-foreground">
          {t("nav_search") || "Search products"}
        </div>
        <CommandInput
          value={searchTerm}
          onValueChange={setSearchTerm}
          placeholder={t("nav_search_placeholder") || "Search the catalog"}
        />
        <CommandList>
          <CommandEmpty>
            {searchTerm.trim() ? t("nav_search_empty") || "No products found" : t("nav_search_hint") || "Start typing to see suggestions"}
          </CommandEmpty>
          <CommandGroup heading={searchTerm.trim() ? t("nav_search_results") || "Results" : t("nav_search_popular") || "Suggestions"}>
            {suggestions.map((product) => (
              <CommandItem
                key={product.id}
                value={product.title}
                className="flex items-center gap-3"
                onSelect={() => handleNavigate(product.id)}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                    {product.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-foreground">{product.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(product.price?.USD ?? 0)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
