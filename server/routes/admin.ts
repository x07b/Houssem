import { RequestHandler } from "express";
import crypto from "crypto";
import { readStore, writeStore } from "../store";
import { AdminProduct, Banner, HomeToggles, PromoCode, StoreState } from "@shared/entities";

const ADMIN_USER = "root";
const ADMIN_PASS = "root";
const SECRET = process.env.ADMIN_TOKEN_SECRET || "dev_secret";

function sign(payload: object) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${header}.${body}`;
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token: string | undefined) {
  if (!token) return null;
  const [h, b, s] = token.split(".");
  if (!h || !b || !s) return null;
  const data = `${h}.${b}`;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (expected !== s) return null;
  try { return JSON.parse(Buffer.from(b, "base64url").toString("utf-8")); } catch { return null; }
}

export const adminLogin: RequestHandler = (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = sign({ sub: username, ts: Date.now() });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  next();
};

// Products CRUD
export const listProducts: RequestHandler = (_req, res) => res.json(readStore().products);
export const createProduct: RequestHandler = (req, res) => {
  const store = readStore();
  const product: AdminProduct = { id: crypto.randomUUID(), ...req.body };
  store.products.push(product);
  writeStore(store);
  res.json(product);
};
export const updateProduct: RequestHandler = (req, res) => {
  const store = readStore();
  const idx = store.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.products[idx] = { ...store.products[idx], ...req.body };
  writeStore(store);
  res.json(store.products[idx]);
};
export const deleteProduct: RequestHandler = (req, res) => {
  const store = readStore();
  store.products = store.products.filter((p) => p.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
};

// Banners
export const listBanners: RequestHandler = (_req, res) => res.json(readStore().banners);
export const upsertBanner: RequestHandler = (req, res) => {
  const store = readStore();
  const banner: Banner = req.body.id ? req.body : { id: crypto.randomUUID(), ...req.body };
  const idx = store.banners.findIndex((b) => b.id === banner.id);
  if (idx === -1) store.banners.push(banner); else store.banners[idx] = banner;
  writeStore(store);
  res.json(banner);
};
export const deleteBanner: RequestHandler = (req, res) => {
  const store = readStore();
  store.banners = store.banners.filter((b) => b.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
};

// Toggles
export const getToggles: RequestHandler = (_req, res) => res.json(readStore().toggles);
export const setToggles: RequestHandler = (req, res) => {
  const store = readStore();
  store.toggles = { ...store.toggles, ...(req.body as HomeToggles) };
  writeStore(store);
  res.json(store.toggles);
};

// Promo codes
export const listPromos: RequestHandler = (_req, res) => res.json(readStore().promos);
export const upsertPromo: RequestHandler = (req, res) => {
  const store = readStore();
  const promo: PromoCode = req.body.id ? req.body : { id: (req.body.id || "").toUpperCase() || crypto.randomUUID(), ...req.body };
  const idx = store.promos.findIndex((p) => p.id === promo.id);
  if (idx === -1) store.promos.push(promo); else store.promos[idx] = promo;
  writeStore(store);
  res.json(promo);
};
export const deletePromo: RequestHandler = (req, res) => {
  const store = readStore();
  store.promos = store.promos.filter((p) => p.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
};
