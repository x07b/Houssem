import { RequestHandler } from "express";
import crypto from "crypto";
import { readStore, writeStore } from "../store";

export const listCategories: RequestHandler = (_req, res) => {
  const store: any = readStore();
  const list = (store.categories || []).filter((c: any) => c.published !== false);
  res.json(list);
};

export const createCategory: RequestHandler = (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Name is required" });
  const store: any = readStore();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const exists = (store.categories || []).some((c: any) => c.slug === slug);
  if (exists) return res.status(409).json({ error: "Category exists" });
  const cat = { id: crypto.randomUUID(), name, slug, published: true };
  store.categories = store.categories || [];
  store.categories.push(cat);
  writeStore(store);
  res.json(cat);
};

export const deleteCategory: RequestHandler = (req, res) => {
  const id = String(req.params.id || "");
  const store: any = readStore();
  const used = (store.products || []).some((p: any) => p.categoryId === id);
  if (used) return res.status(400).json({ error: "Category is used by products" });
  const before = (store.categories || []).length;
  store.categories = (store.categories || []).filter((c: any) => c.id !== id);
  writeStore(store);
  res.json({ ok: true, removed: before - (store.categories || []).length });
};
