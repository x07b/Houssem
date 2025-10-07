import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProducts } from "@/context/ProductsContext";
import { useI18n } from "@/context/I18nContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Link } from "react-router-dom";
import { Loader2, Search, X, MoreHorizontal, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SortKey = "relevance" | "price_asc" | "price_desc" | "popularity" | "newest";

type Filters = {
  platforms: Set<string>;
  category: Set<string>;
  region: Set<string>;
  priceMax?: number;
};

function track(event: string, payload?: Record<string, any>) {
  try { console.debug("analytics:", event, payload || {}); } catch {}
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(() => typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const listener = () => setMatches(m.matches);
    listener();
    m.addEventListener("change", listener);
    return () => m.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const { t } = useI18n();
  // Only one of Dialog/Sheet is visible via CSS; state shared
  return (
    <>
      <div className="hidden md:block">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="p-0 w-[min(92vw,720px)] overflow-hidden border shadow-xl rounded-2xl">
            <DialogTitle className="sr-only">{t("nav_search")}</DialogTitle>
            <SearchContent onClose={() => onOpenChange(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="p-0 w-screen h-[100svh] rounded-t-2xl overflow-hidden">
            <SheetTitle className="sr-only">{t("nav_search")}</SheetTitle>
            <SearchContent onClose={() => onOpenChange(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function useDebouncedQuery(ms: number) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), ms);
    return () => clearTimeout(id);
  }, [query, ms]);
  return { query, setQuery, debounced };
}

function SearchContent({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { products } = useProducts();
  const { format } = useCurrency();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [visible, setVisible] = useState(20);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filters, setFilters] = useState<Filters>({ platforms: new Set(), category: new Set(), region: new Set(), priceMax: undefined });
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("recentSearches") || "[]"); } catch { return []; }
  });
  const cacheRef = useRef<Map<string, any[]>>(new Map());
  const controllerRef = useRef<AbortController | null>(null);

  const { query, setQuery, debounced } = useDebouncedQuery(275);

  const popular = useMemo(() => products.slice(0, Math.min(products.length, 6)), [products]);

  useEffect(() => {
    track("search_opened");
    // focus input when content mounts
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i)=>Math.min(i+1, filtered.length-1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i)=>Math.max(i-1, 0)); }
      if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          const item = filtered[activeIndex];
          const link = document.getElementById(`search-opt-${item.id}`) as HTMLAnchorElement | null;
          if (link) link.click();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex]);

  const filtered = useMemo(() => {
    let items = results as any[];
    // Filters
    if (filters.platforms.size) items = items.filter(p => filters.platforms.has((p as any).platform));
    if (filters.category.size) items = items.filter(p => filters.category.has((p as any).category));
    if (filters.region.size) items = items.filter(p => filters.region.has((p as any).region));
    if (filters.priceMax != null) items = items.filter(p => (p.price?.USD ?? 0) <= (filters.priceMax as number));
    // Sort
    items = [...items];
    if (sort === "price_asc") items.sort((a,b)=> (a.price?.USD ?? 0) - (b.price?.USD ?? 0));
    if (sort === "price_desc") items.sort((a,b)=> (b.price?.USD ?? 0) - (a.price?.USD ?? 0));
    if (sort === "newest") items.sort((a,b)=> (new Date(b.createdAt||0).getTime()) - (new Date(a.createdAt||0).getTime()));
    // popularity not available; leave as-is
    return items;
  }, [results, filters, sort]);

  useEffect(() => {
    if (!debounced.trim()) { setResults([]); setIsLoading(false); setError(null); return; }
    const q = debounced.trim().toLowerCase();
    track("search_typed", { query: q });
    if (controllerRef.current) controllerRef.current.abort();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;
    const cached = cacheRef.current.get(q);
    if (cached) { setResults(cached); setIsLoading(false); setError(null); setVisible(20); return; }
    setIsLoading(true); setError(null);
    // Simulate async search (could be replaced with fetch) with cancel support
    const timeout = setTimeout(() => {
      if (ctrl.signal.aborted) return;
      const found = products.filter(p => {
        const text = `${p.title} ${p.description || ""} ${(p as any).category || ""} ${(p as any).platform || ""}`.toLowerCase();
        return text.includes(q);
      });
      cacheRef.current.set(q, found);
      setResults(found);
      setVisible(20);
      setIsLoading(false);
      if (found.length === 0) track("search_empty", { query: q });
      else track("search_result_view", { query: q, count: found.length });
    }, 200);
    return () => { clearTimeout(timeout); ctrl.abort(); };
  }, [debounced, products]);

  function commitRecent(q: string) {
    const next = [q, ...recent.filter(r => r !== q)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem("recentSearches", JSON.stringify(next)); } catch {}
  }

  function clearAllRecent() {
    setRecent([]);
    try { localStorage.removeItem("recentSearches"); } catch {}
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;
    commitRecent(q);
  }

  const totalCount = filtered.length;
  const listToRender = filtered.slice(0, visible);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const at = el.scrollTop / (el.scrollHeight - el.clientHeight);
    if (at > 0.75 && visible < totalCount && !isLoading) {
      setVisible(v => Math.min(v + 20, totalCount));
    }
  }

  function toggleSet(s: Set<string>, v: string) {
    const n = new Set(s);
    if (n.has(v)) n.delete(v); else n.add(v);
    return n;
  }

  const platformOptions = ["PC","PS","Xbox","Switch"];
  const categoryOptions = ["Gaming","Software","Gift cards"];
  const regionOptions = ["Global","EU","US"];
  const priceOptions: {label: string, value?: number}[] = [
    { label: "≤$10", value: 10 },
    { label: "≤$25", value: 25 },
    { label: "≤$50", value: 50 },
  ];

  return (
    <div role="dialog" aria-modal="true" className="flex h-full flex-col bg-background">
      <form onSubmit={onSubmit} className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              role="search"
              placeholder={t("search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pr-10"
              aria-autocomplete="list"
              aria-controls="search-listbox"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {query && (
            <Button type="button" variant="ghost" className="h-9 px-2" aria-label="Clear" onClick={() => setQuery("")}> 
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="button" variant="ghost" className="h-9 px-2" aria-label={t("close") || "Close"} onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Filters / Sorting */}
        <div className="px-4 pb-3 pt-2 border-b">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {platformOptions.map(p => (
              <Button key={p} type="button" variant="outline" size="sm" className={cn("rounded-full h-8 px-3", filters.platforms.has(p) && "bg-accent text-accent-foreground")}
                onClick={() => { setFilters(f => ({...f, platforms: toggleSet(f.platforms, p)})); track("search_filter_applied", { type: "platform", value: p }); }}>
                {p}
              </Button>
            ))}
            {categoryOptions.map(c => (
              <Button key={c} type="button" variant="outline" size="sm" className={cn("rounded-full h-8 px-3", filters.category.has(c) && "bg-accent text-accent-foreground")}
                onClick={() => { setFilters(f => ({...f, category: toggleSet(f.category, c)})); track("search_filter_applied", { type: "category", value: c }); }}>
                {c}
              </Button>
            ))}
            {regionOptions.map(r => (
              <Button key={r} type="button" variant="outline" size="sm" className={cn("rounded-full h-8 px-3", filters.region.has(r) && "bg-accent text-accent-foreground")}
                onClick={() => { setFilters(f => ({...f, region: toggleSet(f.region, r)})); track("search_filter_applied", { type: "region", value: r }); }}>
                {r}
              </Button>
            ))}
            {priceOptions.map(p => (
              <Button key={p.label} type="button" variant="outline" size="sm" className={cn("rounded-full h-8 px-3", filters.priceMax===p.value && "bg-accent text-accent-foreground")}
                onClick={() => { setFilters(f => ({...f, priceMax: f.priceMax===p.value ? undefined : p.value })); track("search_filter_applied", { type: "price", value: p.value }); }}>
                {p.label}
              </Button>
            ))}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <label className="text-xs text-muted-foreground">Sort</label>
              <select className="bg-transparent text-sm outline-none" value={sort} onChange={(e)=> setSort(e.target.value as SortKey)}>
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </form>

      {/* Body */}
      <div className="flex-1 grid md:grid-cols-2" onScroll={onScroll}>
        {/* Left column: Suggestions/Recent */}
        <div className="hidden md:block border-r">
          <ScrollArea className="h-full">
            {!debounced && (
              <div className="p-4 space-y-6">
                <section>
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground">{t("search.recent")}</h3>
                  <div className="mt-2 space-y-1">
                    {recent.length === 0 ? (
                      <p className="text-sm text-muted-foreground">—</p>
                    ) : (
                      recent.map((r) => (
                        <button key={r} className="text-sm text-foreground hover:underline" onClick={() => setQuery(r)}>{r}</button>
                      ))
                    )}
                  </div>
                  {recent.length > 0 && (
                    <Button variant="ghost" size="sm" className="mt-2 px-2" onClick={clearAllRecent}>{t("search.clear_all")}</Button>
                  )}
                </section>
                <section>
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground">{t("search.popular")}</h3>
                  <ul className="mt-2 space-y-2">
                    {popular.map((p)=> (
                      <li key={p.id}>
                        <Link to={`/product/${p.id}`} className="text-sm hover:underline">{p.title}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right/Single column: Results */}
        <div className="min-h-0">
          <ScrollArea className="h-full" onScroll={onScroll}>
            <div role="status" aria-live="polite" className="sr-only">
              {totalCount ? t("search.results_count").replace("{count}", String(totalCount)) : ""}
            </div>

            {/* Idle */}
            {!debounced && (
              <div className="p-4 space-y-6 md:hidden">
                <section>
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground">{t("search.recent")}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recent.length === 0 ? (
                      <p className="text-sm text-muted-foreground">—</p>
                    ) : (
                      recent.map((r) => (
                        <Button key={r} variant="outline" size="sm" className="rounded-full" onClick={() => setQuery(r)}>{r}</Button>
                      ))
                    )}
                    {recent.length > 0 && (
                      <Button variant="ghost" size="sm" className="ml-auto" onClick={clearAllRecent}>{t("search.clear_all")}</Button>
                    )}
                  </div>
                </section>
                <section>
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground">{t("search.popular")}</h3>
                  <ul className="mt-2 space-y-2">
                    {popular.map((p)=> (
                      <li key={p.id}>
                        <Link to={`/product/${p.id}`} className="text-sm hover:underline">{p.title}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="p-4 space-y-3">
                <div className="h-0.5 w-full bg-muted overflow-hidden rounded">
                  <div className="h-full w-1/3 animate-[progress_1.2s_ease_infinite] bg-primary" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-md bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-muted rounded" />
                      <div className="h-4 w-1/3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-destructive">{t("search.retry")}</p>
                <Button size="sm" onClick={() => {
                  setError(null);
                  const q = debounced; // retry
                  setQuery(q);
                }}>{t("search.retry")}</Button>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && debounced && filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t("search.no_results").replace("{query}", debounced)}
              </div>
            )}

            {/* Results */}
            {!isLoading && filtered.length > 0 && (
              <ul id="search-listbox" role="listbox" className="p-2">
                {listToRender.map((p, idx) => (
                  <li key={p.id} role="option" aria-selected={activeIndex===idx} className={cn("group relative flex items-center gap-3 rounded-lg p-2 hover:bg-accent", activeIndex===idx && "bg-accent")}
                    onMouseEnter={() => setActiveIndex(idx)}>
                    <Link id={`search-opt-${p.id}`} to={`/product/${p.id}`} className="flex flex-1 items-center gap-3 min-h-[72px]">
                      <img src={p.image} alt={p.title} loading="lazy" className="h-16 w-16 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate font-medium text-foreground">{p.title}</h4>
                          {typeof p.discountPercent === "number" && p.discountPercent>0 && (
                            <span className="rounded bg-primary/10 text-primary text-xs px-2 py-0.5">-{p.discountPercent}%</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {(p as any).platform || (p as any).region || (p as any).delivery || ""}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {format(p.price?.USD ?? 0)}
                      </div>
                    </Link>
                    <div className="absolute right-3 hidden md:flex">
                      <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute right-3 md:hidden">
                      <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
                {visible < totalCount && (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {visible >= totalCount && totalCount > 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground">— End —</div>
                )}
              </ul>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
