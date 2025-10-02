import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BadgePercent, Box, Gamepad2, Gift, Loader2, Search, X } from "lucide-react";

interface SuggestBase { id: string; title: string; }
interface ProductItem extends SuggestBase { type: "product"; subtitle?: string; price?: number; currency?: string; icon: string }
interface CatPlatItem extends SuggestBase { type: "category" | "platform"; icon: string }

type SuggestItem = ProductItem | CatPlatItem;

const iconFor = (icon?: string) => {
  switch (icon) {
    case "gift":
      return <Gift className="mr-2 h-4 w-4" />;
    case "gamepad-2":
      return <Gamepad2 className="mr-2 h-4 w-4" />;
    case "badge-percent":
      return <BadgePercent className="mr-2 h-4 w-4" />;
    case "box":
      return <Box className="mr-2 h-4 w-4" />;
    default:
      return <Search className="mr-2 h-4 w-4" />;
  }
};

const cache = new Map<string, SuggestItem[]>();
const RECENT_KEY = "recent_searches_v1";

function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  const before = text.slice(0, i);
  const match = text.slice(i, i + q.length);
  const after = text.slice(i + q.length);
  return (
    <>
      {before}
      <mark className="bg-transparent font-semibold">{match}</mark>
      {after}
    </>
  );
}

function useRecent(): [string[], (term: string) => void, () => void] {
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const save = (next: string[]) => {
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 8))); } catch {}
  };
  const add = (term: string) => {
    const t = term.trim();
    if (!t) return;
    save([t, ...recent.filter((x) => x.toLowerCase() !== t.toLowerCase())]);
  };
  const clear = () => save([]);
  return [recent, add, clear];
}

async function fetchSuggest(q: string, signal?: AbortSignal): Promise<SuggestItem[]> {
  const key = q.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  const url = `/api/suggest?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal });
  const data = (await res.json()) as SuggestItem[];
  cache.set(key, data);
  return data;
}

export default function HeaderSearch() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SuggestItem[]>([]);
  const [recent, addRecent] = useRecent();
  const debounced = useDebounced(query, 200);
  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchSuggest(debounced, controller.signal);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [debounced]);

  const onPick = (it: SuggestItem | null, freeText?: string) => {
    const term = freeText ?? query;
    if (it) {
      if (it.type === "product") navigate(`/product/${encodeURIComponent(it.id)}`);
      if (it.type === "category") navigate(`/search?category=${encodeURIComponent(it.id)}`);
      if (it.type === "platform") navigate(`/search?platform=${encodeURIComponent(it.id)}`);
      addRecent(it.title);
    } else if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      addRecent(term.trim());
    }
    setOverlayOpen(false);
  };

  // focus management + body lock
  useEffect(() => {
    if (overlayOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 0);

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOverlayOpen(false);
        }
        if (e.key === "Tab" && overlayRootRef.current && window.innerWidth >= 1024) {
          const focusables = overlayRootRef.current.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement as HTMLElement | null;
          if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          } else if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
          }
        }
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
        triggerRef.current?.focus();
      };
    }
  }, [overlayOpen]);

  const desktopList = (
    <div className="max-h-96 overflow-auto">
      <CommandList className="max-h-96">
        {results.length === 0 && query && !loading && (
          <CommandEmpty>No results. Try different keywords.</CommandEmpty>
        )}
        {results.length > 0 && (
          <>
            <CommandGroup heading="Top matches">
              {results.filter((r) => r.type === "product").map((it) => (
                <CommandItem key={it.id} value={it.title} onSelect={() => onPick(it)}>
                  {iconFor(it.icon)}
                  <span className="truncate">{highlight(it.title, query)}</span>
                  {"price" in it && it.price != null && (
                    <span className="ml-auto text-muted-foreground">{it.currency || "USD"} {it.price.toFixed(2)}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Categories & Platforms">
              {results.filter((r) => r.type !== "product").map((it) => (
                <CommandItem key={it.id} value={it.title} onSelect={() => onPick(it)}>
                  {iconFor((it as any).icon)}
                  <span className="truncate">{highlight(it.title, query)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {!query && recent.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent searches">
              {recent.map((r, i) => (
                <CommandItem key={i} value={r} onSelect={() => onPick(null, r)}>
                  <Search className="mr-2 h-4 w-4" />
                  <span className="truncate">{r}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </div>
  );

  return (
    <>
      {/* Desktop trigger: looks like input */}
      <button
        ref={triggerRef}
        type="button"
        className="hidden lg:flex items-center gap-2 rounded-full border bg-background text-sm text-muted-foreground px-4 h-11 w-[480px] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200"
        onClick={() => setOverlayOpen(true)}
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
        <span className="truncate text-left">Search games, gift cards, software…</span>
      </button>

      {/* Mobile/Tablet icon trigger */}
      <button
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-muted"
        aria-label="Search"
        onClick={() => setOverlayOpen(true)}
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Mobile/Tablet sheet overlay */}
      <Sheet open={overlayOpen && typeof window !== 'undefined' && window.innerWidth < 1024} onOpenChange={setOverlayOpen}>
        <SheetContent side="top" className="p-0 h-screen">
          <div className="border-b bg-background">
            <div className="container px-4 md:px-8 h-16 flex items-center gap-2">
              <div className="relative flex-1">
                <Command>
                  <div className="relative">
                    <CommandInput
                      ref={inputRef as any}
                      placeholder="Search games, gift cards, software…"
                      value={query}
                      onValueChange={setQuery}
                      role="combobox"
                      aria-expanded={results.length > 0}
                      aria-controls="search-mobile-list"
                      className="h-11 pl-10"
                    />
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {loading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </Command>
              </div>
              <button aria-label="Close search" className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-muted" onClick={() => setOverlayOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="container px-4 md:px-8 py-2">
            <Command>
              <CommandList id="search-mobile-list" className="max-h-[60vh] overflow-auto">
                <CommandEmpty>No results. Try different keywords.</CommandEmpty>
                {results.length > 0 && (
                  <>
                    <CommandGroup heading="Top matches">
                      {results.filter((r) => r.type === "product").map((it) => (
                        <CommandItem key={it.id} value={it.title} onSelect={() => onPick(it)}>
                          {iconFor(it.icon)}
                          <span className="truncate">{highlight(it.title, query)}</span>
                          {"price" in it && it.price != null && (
                            <span className="ml-auto text-muted-foreground">{it.currency || "USD"} {it.price.toFixed(2)}</span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Categories & Platforms">
                      {results.filter((r) => r.type !== "product").map((it) => (
                        <CommandItem key={it.id} value={it.title} onSelect={() => onPick(it)}>
                          {iconFor((it as any).icon)}
                          <span className="truncate">{highlight(it.title, query)}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
                {!query && recent.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Recent searches">
                      {recent.map((r, i) => (
                        <CommandItem key={i} value={r} onSelect={() => onPick(null, r)}>
                          <Search className="mr-2 h-4 w-4" />
                          <span className="truncate">{r}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop anchored overlay with backdrop */}
      {overlayOpen && typeof window !== 'undefined' && window.innerWidth >= 1024 && createPortal(
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0" onClick={() => setOverlayOpen(false)} />
          <div className="absolute inset-x-0 top-16">
            <div className="mx-auto container px-4 md:px-8">
              <div className="rounded-b-md border bg-background shadow-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2 data-[state=open]:fade-in-0">
                <div className="h-16 flex items-center gap-2 px-3 md:px-4 border-b">
                  <div className="relative flex-1">
                    <Command>
                      <div className="relative">
                        <CommandInput
                          ref={inputRef as any}
                          placeholder="Search games, gift cards, software…"
                          value={query}
                          onValueChange={setQuery}
                          role="combobox"
                          aria-expanded={results.length > 0}
                          aria-controls="search-desktop-overlay-list"
                          className="h-11 pl-10"
                        />
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        {loading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </Command>
                  </div>
                  <button aria-label="Close search" className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-muted" onClick={() => setOverlayOpen(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-auto">
                  <Command>
                    <CommandList id="search-desktop-overlay-list">
                      <CommandEmpty>No results. Try different keywords.</CommandEmpty>
                      {results.length > 0 && (
                        <>
                          <CommandGroup heading="Top matches">
                            {results.filter((r) => r.type === "product").map((it) => (
                              <CommandItem key={it.id} value={it.title} onSelect={() => onPick(it)}>
                                {iconFor(it.icon)}
                                <span className="truncate">{highlight(it.title, query)}</span>
                                {"price" in it && it.price != null && (
                                  <span className="ml-auto text-muted-foreground">{it.currency || "USD"} {it.price.toFixed(2)}</span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup heading="Categories & Platforms">
                            {results.filter((r) => r.type !== "product").map((it) => (
                              <CommandItem key={it.id} value={it.title} onSelect={() => onPick(it)}>
                                {iconFor((it as any).icon)}
                                <span className="truncate">{highlight(it.title, query)}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                      {!query && recent.length > 0 && (
                        <>
                          <CommandSeparator />
                          <CommandGroup heading="Recent searches">
                            {recent.map((r, i) => (
                              <CommandItem key={i} value={r} onSelect={() => onPick(null, r)}>
                                <Search className="mr-2 h-4 w-4" />
                                <span className="truncate">{r}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </div>
              </div>
            </div>
          </div>
        </div>, document.body)
      }
    </>
  );
}
