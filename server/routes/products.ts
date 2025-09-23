import { RequestHandler } from "express";
import { readStore } from "../store";

export const listPublicProducts: RequestHandler = (_req, res) => {
  const store = readStore();
  res.json(store.products || []);
};

export const getPublicProduct: RequestHandler = (req, res) => {
  const id = String(req.params.id);
  const store = readStore();
  const prod = (store.products || []).find(p=>p.id===id);
  if (!prod) return res.status(404).json({ error: "Not found" });
  res.json(prod);
};
