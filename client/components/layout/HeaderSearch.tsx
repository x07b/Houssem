import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BadgePercent, Box, Gamepad2, Gift, Loader2, Search } from "lucide-react";

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
      {/* Desktop inline search */}
      <div className="hidden lg:block">
        <div className="relative w-[480px] focus-within:w-[640px] transition-all duration-200">
          <Command className="rounded-full border bg-background text-foreground">
            <div className="relative">
              <CommandInput
                placeholder="Search games, gift cards, software…"
                value={query}
                onValueChange={setQuery}
                aria-expanded={results.length > 0}
                aria-controls="search-desktop-list"
                className="h-11 pl-10 rounded-full"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {(results.length > 0 || (!query && recent.length > 0)) && (
              <div id="search-desktop-list" className="absolute left-0 right-0 top-full mt-2 z-50 rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
                {desktopList}
              </div>
            )}
          </Command>
        </div>
      </div>

      {/* Mobile/Tablet icon + overlay */}
      <button
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-muted"
        aria-label="Search"
        onClick={() => setOverlayOpen(true)}
      >
        <Search className="h-4 w-4" />
      </button>

      <CommandDialog open={overlayOpen} onOpenChange={setOverlayOpen}>
        <Command className="h-[85vh]">
          <div className="relative">
            <CommandInput
              placeholder="Search games, gift cards, software…"
              value={query}
              onValueChange={setQuery}
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <CommandList>
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
      </CommandDialog>
    </>
  );
}
