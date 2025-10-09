import fs from "fs";
import path from "path";
import crypto from "crypto";
import { StoreState } from "@shared/entities";

const DATA_PATH = path.join(process.cwd(), "server", "data");
const FILE = path.join(DATA_PATH, "store.json");

const defaultState: any = {
  products: [],
  banners: [],
  promos: [],
  categories: [
    { id: crypto.randomUUID(), name: "Softwares", slug: "softwares", published: true },
  ],
  toggles: { showNewsletter: true, showPromo: true, showPremium: true },
  orders: [],
};

export function ensureStore() {
  if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(defaultState, null, 2));
}

export function readStore(): StoreState {
  ensureStore();
  const raw = fs.readFileSync(FILE, "utf-8");
  const store = JSON.parse(raw) as StoreState & { categories?: any[] };
  // Ensure default categories exist for existing stores
  const required = [
    { name: "Softwares", slug: "softwares" },
  ];
  let updated = false;
  store.categories = store.categories || [];
  for (const req of required) {
    if (!store.categories.some((c: any) => c?.slug === req.slug)) {
      store.categories.push({ id: crypto.randomUUID(), name: req.name, slug: req.slug, published: true });
      updated = true;
    }
  }
  if (updated) writeStore(store as StoreState);
  return store as StoreState;
}

export function writeStore(next: StoreState) {
  ensureStore();
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
}
