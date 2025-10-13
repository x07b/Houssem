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
  try {
    if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(defaultState, null, 2));
  } catch (error) {
    // Filesystem not writable (e.g., Vercel serverless) - that's ok, use Supabase instead
    console.warn("Cannot write to filesystem - using Supabase or in-memory storage");
  }
}

export function readStore(): StoreState {
  // Dev-gate: disable local store in production/serverless environments
  if (process.env.DISABLE_LOCAL_STORE === 'true' || process.env.NODE_ENV === 'production') {
    console.warn("Local store disabled - using Supabase instead");
    return defaultState as StoreState;
  }
  
  try {
    ensureStore();
    const raw = fs.readFileSync(FILE, "utf-8");
    const store = JSON.parse(raw) as StoreState & { categories?: any[] };
  
  // Ensure all required fields are arrays
  let updated = false;
  if (!Array.isArray(store.products)) {
    store.products = [];
    updated = true;
  }
  if (!Array.isArray(store.banners)) {
    store.banners = [];
    updated = true;
  }
  if (!Array.isArray(store.promos)) {
    store.promos = [];
    updated = true;
  }
  if (!Array.isArray(store.orders)) {
    store.orders = [];
    updated = true;
  }
  
  // Ensure default categories exist for existing stores
  store.categories = store.categories || [];
  const required = [
    { name: "Softwares", slug: "softwares" },
  ];
  for (const req of required) {
    if (!store.categories.some((c: any) => c?.slug === req.slug)) {
      store.categories.push({ id: crypto.randomUUID(), name: req.name, slug: req.slug, published: true });
      updated = true;
    }
  }
  
    if (updated) writeStore(store as StoreState);
    return store as StoreState;
  } catch (error) {
    // Return empty store if file system isn't available (Vercel serverless)
    console.warn("Cannot read from filesystem - returning default store:", error);
    return defaultState as StoreState;
  }
}

export function writeStore(next: StoreState) {
  // Dev-gate: disable local store in production/serverless environments
  if (process.env.DISABLE_LOCAL_STORE === 'true' || process.env.NODE_ENV === 'production') {
    console.warn("Local store disabled - using Supabase instead");
    return;
  }
  
  try {
    ensureStore();
    fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
  } catch (error) {
    // Filesystem not writable (e.g., Vercel serverless) - log warning
    console.warn("Cannot write to filesystem - changes not persisted. Use Supabase instead.");
  }
}
