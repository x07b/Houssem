import fs from "fs";
import path from "path";
import { StoreState } from "@shared/entities";

const DATA_PATH = path.join(process.cwd(), "server", "data");
const FILE = path.join(DATA_PATH, "store.json");

const defaultState: any = {
  products: [],
  banners: [],
  promos: [],
  categories: [],
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
  return JSON.parse(raw) as StoreState;
}

export function writeStore(next: StoreState) {
  ensureStore();
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
}
