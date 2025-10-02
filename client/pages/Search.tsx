import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Search } from "lucide-react";

interface SuggestBase { id: string; title: string; }
interface ProductItem extends SuggestBase { type: "product"; subtitle?: string; price?: number; currency?: string; icon: string }
interface CatPlatItem extends SuggestBase { type: "category" | "platform"; icon: string }

type SuggestItem = ProductItem | CatPlatItem;

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState<SuggestItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setResults)
      .catch(() => setResults([]));
    return () => controller.abort();
  }, [q]);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Search</h1>
        {q && <p className="text-muted-foreground">Showing results for “{q}”.</p>}
        <Command>
          <CommandList>
            <CommandEmpty>No results. Try different keywords.</CommandEmpty>
            <CommandGroup heading="Top matches">
              {results.filter((r) => r.type === "product").map((it) => (
                <Link to={`/product/${it.id}`} key={it.id}>
                  <CommandItem>
                    <Search className="mr-2 h-4 w-4" />
                    <span>{it.title}</span>
                    {"price" in it && it.price != null && (
                      <span className="ml-auto text-muted-foreground">{it.currency || "USD"} {it.price.toFixed(2)}</span>
                    )}
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Categories & Platforms">
              {results.filter((r) => r.type !== "product").map((it) => (
                <Link to={`/search?${it.type}=${it.id}`} key={it.id}>
                  <CommandItem>
                    <Search className="mr-2 h-4 w-4" />
                    <span>{it.title}</span>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </Layout>
  );
}
