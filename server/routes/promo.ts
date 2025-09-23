import { RequestHandler } from "express";
import { readStore } from "../store";

export const validatePromo: RequestHandler = (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  if (!code) return res.status(400).json({ found: false, active: false, percent: 0, code });
  const store = readStore();
  const promo = store.promos.find(p => p.id.toUpperCase() === code);
  if (!promo) return res.json({ found: false, active: false, percent: 0, code });
  return res.json({ found: true, active: !!promo.active, percent: promo.percent, code: promo.id });
};
