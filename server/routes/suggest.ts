import { RequestHandler } from "express";
import { readStore } from "../store";

export type SuggestItem =
  | { type: "product"; id: string; title: string; subtitle?: string; price?: number; currency?: string; icon: string }
  | { type: "category" | "platform"; id: string; title: string; icon: string };

const CATEGORIES: { id: string; title: string; icon: string }[] = [
  { id: "gift-cards", title: "Gift Cards", icon: "gift" },
  { id: "games", title: "Games", icon: "gamepad-2" },
  { id: "software", title: "Software", icon: "box" },
  { id: "subscriptions", title: "Subscriptions", icon: "badge-percent" },
];

const PLATFORMS: { id: string; title: string; icon: string }[] = [
  { id: "steam", title: "Steam", icon: "gamepad-2" },
  { id: "psn", title: "PSN", icon: "gamepad-2" },
  { id: "xbox", title: "Xbox", icon: "gamepad-2" },
  { id: "riot", title: "Riot", icon: "gift" },
];

function norm(s: string) {
  return s.toLowerCase().normalize("NFKD");
}

function scoreMatch(text: string, q: string) {
  const t = norm(text);
  const query = norm(q);
  if (!query) return 0;
  const idx = t.indexOf(query);
  if (idx === -1) return -1;
  // Prefer earlier matches and shorter titles slightly
  return 100 - idx - Math.min(30, Math.abs(t.length - query.length));
}

export const handleSuggest: RequestHandler = (req, res) => {
  const q = String(req.query.q || "").trim();
  const store = readStore();
  const items: SuggestItem[] = [];

  // Products
  const prods = (store.products || []).map((p) => {
    const t = p.title || "";
    const s = scoreMatch(t, q);
    return { p, s };
  })
  .filter((x) => (q ? x.s >= 0 : true))
  .sort((a, b) => b.s - a.s)
  .slice(0, 5);

  for (const { p } of prods) {
    const price = p.price?.USD ?? undefined;
    items.push({
      type: "product",
      id: p.id,
      title: p.title,
      subtitle: undefined,
      price,
      currency: price != null ? "USD" : undefined,
      icon: "gift",
    });
  }

  // Categories & Platforms
  const allCats = [...CATEGORIES, ...PLATFORMS.map((x) => ({ ...x, type: "platform" as const }))];
  const matchedCats = allCats
    .map((c) => ({ c, s: q ? scoreMatch(c.title, q) : 1 }))
    .filter((x) => (q ? x.s >= 0 : true))
    .sort((a, b) => b.s - a.s)
    .slice(0, 5)
    .map(({ c }) => ({
      type: (PLATFORMS.find((p) => p.id === c.id) ? "platform" : "category") as "category" | "platform",
      id: c.id,
      title: c.title,
      icon: c.icon,
    }));

  // Compose up to 8
  const mixed: SuggestItem[] = [];
  for (const it of items) mixed.push(it);
  for (const it of matchedCats) if (mixed.length < 8) mixed.push(it as SuggestItem);

  res.json(mixed);
};
