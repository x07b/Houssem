import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSendEmail } from "./routes/order";
import { adminLogin, requireAuth, listProducts, createProduct, updateProduct, deleteProduct, listBanners, upsertBanner, deleteBanner, getToggles, setToggles, listPromos, upsertPromo, deletePromo, listOrders, getProfile, updateProfile, changePassword } from "./routes/admin";
import { listProductsSupabase, createProductSupabase, updateProductSupabase, deleteProductSupabase } from "./routes/products-supabase";
import { handleCheckout, getOrderByCode, handleFlouciWebhook } from "./routes/checkout";
import { validatePromo } from "./routes/promo";
import { listPublicProducts, getPublicProduct } from "./routes/products";
import { listPublicProductsSupabase, getPublicProductSupabase } from "./routes/products-public-supabase";
import { listCategories, createCategory, updateCategory, deleteCategory } from "./routes/categories";

export function createServer() {
  const app = express();
  
  // Determine if we should use Supabase or local storage
  const useSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);

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
  app.post("/api/webhook/flouci", handleFlouciWebhook);
  app.get("/api/promo/:code", validatePromo);
  
  // Use Supabase-backed product routes if configured
  if (useSupabase) {
    app.get("/api/products", listPublicProductsSupabase);
    app.get("/api/products/:id", getPublicProductSupabase);
  } else {
    app.get("/api/products", listPublicProducts);
    app.get("/api/products/:id", getPublicProduct);
  }

  // Categories API
  app.get("/api/categories", listCategories);
  app.post("/api/categories", createCategory);
  app.put("/api/categories/:id", updateCategory);
  app.delete("/api/categories/:id", deleteCategory);

  // Orders API
  app.get("/api/orders/:code", getOrderByCode);

  // Admin API
  app.post("/api/admin/login", adminLogin);

  app.get("/api/admin/orders", requireAuth, listOrders);
  app.get("/api/admin/orders/:code", requireAuth, getOrderByCode);

  // Use Supabase-backed product routes if configured
  if (useSupabase) {
    app.get("/api/admin/products", requireAuth, listProductsSupabase);
    app.post("/api/admin/products", requireAuth, createProductSupabase);
    app.put("/api/admin/products/:id", requireAuth, updateProductSupabase);
    app.delete("/api/admin/products/:id", requireAuth, deleteProductSupabase);
  } else {
    app.get("/api/admin/products", requireAuth, listProducts);
    app.post("/api/admin/products", requireAuth, createProduct);
    app.put("/api/admin/products/:id", requireAuth, updateProduct);
    app.delete("/api/admin/products/:id", requireAuth, deleteProduct);
  }

  app.get("/api/admin/banners", requireAuth, listBanners);
  app.post("/api/admin/banners", requireAuth, upsertBanner);
  app.delete("/api/admin/banners/:id", requireAuth, deleteBanner);

  app.get("/api/admin/toggles", requireAuth, getToggles);
  app.put("/api/admin/toggles", requireAuth, setToggles);

  app.get("/api/admin/promos", requireAuth, listPromos);
  app.post("/api/admin/promos", requireAuth, upsertPromo);
  app.delete("/api/admin/promos/:id", requireAuth, deletePromo);

  app.get("/api/admin/profile", requireAuth, getProfile);
  app.put("/api/admin/profile", requireAuth, updateProfile);
  app.put("/api/admin/password", requireAuth, changePassword);

  return app;
}
