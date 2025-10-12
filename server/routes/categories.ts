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
  const parentId = req.body?.parentId ? String(req.body.parentId) : undefined;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const store: any = readStore();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const exists = (store.categories || []).some((c: any) => c.slug === slug);
  if (exists) return res.status(409).json({ error: "Category exists" });
  const cat: any = { id: crypto.randomUUID(), name, slug, published: true };
  if (parentId) cat.parentId = parentId;
  store.categories = store.categories || [];
  store.categories.push(cat);
  writeStore(store);
  res.json(cat);
};

export const updateCategory: RequestHandler = (req, res) => {
  const id = String(req.params.id || "");
  const name = String(req.body?.name || "").trim();
  const parentId = req.body?.parentId ? String(req.body.parentId) : undefined;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const store: any = readStore();
  const idx = (store.categories || []).findIndex((c: any) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Category not found" });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const exists = (store.categories || []).some((c: any, i: number) => c.slug === slug && i !== idx);
  if (exists) return res.status(409).json({ error: "Category with this name already exists" });
  store.categories[idx] = { ...store.categories[idx], name, slug };
  if (parentId) {
    store.categories[idx].parentId = parentId;
  } else {
    delete store.categories[idx].parentId;
  }
  writeStore(store);
  res.json(store.categories[idx]);
};

export const deleteCategory: RequestHandler = (req, res) => {
  const id = String(req.params.id || "");
  const store: any = readStore();
  const used = (store.products || []).some((p: any) => p.categoryId === id);
  if (used) return res.status(400).json({ error: "Category is used by products" });
  const hasChildren = (store.categories || []).some((c: any) => c.parentId === id);
  if (hasChildren) return res.status(400).json({ error: "Category has subcategories" });
  const before = (store.categories || []).length;
  store.categories = (store.categories || []).filter((c: any) => c.id !== id);
  writeStore(store);
  res.json({ ok: true, removed: before - (store.categories || []).length });
};
