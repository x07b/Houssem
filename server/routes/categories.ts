import { RequestHandler } from "express";
import crypto from "crypto";
import { readStore, writeStore } from "../store";

export interface Category { id: string; name: string; slug: string; icon?: string; order?: number; isVisible?: boolean }

function byOrder(a: Category, b: Category) {
  return (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name);
}

export const listPublicCategories: RequestHandler = (_req, res) => {
  const { categories = [] } = readStore() as any;
  res.json(categories.filter((c: Category) => c.isVisible !== false).sort(byOrder));
};

export const listCategoryProducts: RequestHandler = (req, res) => {
  const { slug } = req.params as any;
  const store = readStore() as any;
  const cat = (store.categories || []).find((c: Category) => c.slug === slug);
  if (!cat) return res.status(404).json({ error: "Not found" });
  const products = (store.products || []).filter((p: any) => p.categoryId === cat.id);
  // basic filters
  const { platform, region, minPrice, maxPrice, sort } = req.query as any;
  let list = products.slice();
  if (platform) list = list.filter((p) => (p.platform || "").toLowerCase() === String(platform).toLowerCase());
  if (region) list = list.filter((p) => (p.region || "").toLowerCase() === String(region).toLowerCase());
  if (minPrice) list = list.filter((p) => (p.price?.USD ?? 0) >= Number(minPrice));
  if (maxPrice) list = list.filter((p) => (p.price?.USD ?? 0) <= Number(maxPrice));
  if (sort === "price-asc") list.sort((a, b) => (a.price?.USD ?? 0) - (b.price?.USD ?? 0));
  if (sort === "price-desc") list.sort((a, b) => (b.price?.USD ?? 0) - (a.price?.USD ?? 0));
  res.json({ category: cat, products: list });
};

// Admin
export const listAdminCategories: RequestHandler = (_req, res) => {
  res.json((readStore() as any).categories || []);
};

export const upsertCategory: RequestHandler = (req, res) => {
  const store = readStore() as any;
  const body = req.body as Partial<Category>;
  let cat: Category;
  if (body.id) {
    const idx = (store.categories || []).findIndex((c: Category) => c.id === body.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    cat = { ...store.categories[idx], ...body } as Category;
    store.categories[idx] = cat;
  } else {
    cat = { id: crypto.randomUUID(), name: body.name || "Unnamed", slug: body.slug || (body.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), icon: body.icon, order: body.order ?? 0, isVisible: body.isVisible !== false };
    store.categories = store.categories || [];
    store.categories.push(cat);
  }
  writeStore(store);
  res.json(cat);
};

export const deleteCategory: RequestHandler = (req, res) => {
  const store = readStore() as any;
  store.categories = (store.categories || []).filter((c: Category) => c.id !== String(req.params.id));
  writeStore(store);
  res.json({ ok: true });
};
