import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSendEmail } from "./routes/order";
import { adminLogin, requireAuth, listProducts, createProduct, updateProduct, deleteProduct, listBanners, upsertBanner, deleteBanner, getToggles, setToggles, listPromos, upsertPromo, deletePromo, listOrders } from "./routes/admin";
import { handleCheckout, getOrderByCode } from "./routes/checkout";
import { validatePromo } from "./routes/promo";
import { listPublicProducts, getPublicProduct } from "./routes/products";
import { listCategories, createCategory, deleteCategory } from "./routes/categories";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/send-email", handleSendEmail);
  app.post("/api/checkout", handleCheckout);
  app.get("/api/promo/:code", validatePromo);
  app.get("/api/products", listPublicProducts);
  app.get("/api/products/:id", getPublicProduct);

  // Categories API
  app.get("/api/categories", listCategories);
  app.post("/api/categories", createCategory);
  app.delete("/api/categories/:id", deleteCategory);

  // Orders API
  app.get("/api/orders/:code", getOrderByCode);

  // Admin API
  // Health check for envs/runtime
  app.get("/api/admin/login", (_req, res) => {
    const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
    const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
    res.json({ ok: true, hasUrl, hasService, runtime: "nodejs" });
  });
  app.post("/api/admin/login", adminLogin);
  app.get("/api/admin/orders", requireAuth, listOrders);
  app.get("/api/admin/orders/:code", requireAuth, getOrderByCode);

  app.get("/api/admin/products", requireAuth, listProducts);
  app.post("/api/admin/products", requireAuth, createProduct);
  app.put("/api/admin/products/:id", requireAuth, updateProduct);
  app.delete("/api/admin/products/:id", requireAuth, deleteProduct);

  app.get("/api/admin/banners", requireAuth, listBanners);
  app.post("/api/admin/banners", requireAuth, upsertBanner);
  app.delete("/api/admin/banners/:id", requireAuth, deleteBanner);

  app.get("/api/admin/toggles", requireAuth, getToggles);
  app.put("/api/admin/toggles", requireAuth, setToggles);

  app.get("/api/admin/promos", requireAuth, listPromos);
  app.post("/api/admin/promos", requireAuth, upsertPromo);
  app.delete("/api/admin/promos/:id", requireAuth, deletePromo);

  return app;
}
