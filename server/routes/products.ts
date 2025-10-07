import { RequestHandler } from "express";
import { readStore } from "../store";

export const listPublicProducts: RequestHandler = (req, res) => {
  const store: any = readStore();
  const slug = String(req.query.category || "").trim();
  let list = store.products || [];
  if (slug) {
    const cat = (store.categories || []).find((c: any) => c.slug === slug);
    if (cat) list = list.filter((p: any) => p.categoryId === cat.id);
    else list = [];
  }
  res.json(list);
};

export const getPublicProduct: RequestHandler = (req, res) => {
  const id = String(req.params.id);
  const store = readStore();
  const prod = (store.products || []).find(p=>p.id===id);
  if (!prod) return res.status(404).json({ error: "Not found" });
  res.json(prod);
};
