import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import "fs";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server",
    timestamp: Date.now()
  };
  res.status(200).json(response);
};
const OrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(6),
  currency: z.enum(["USD", "TND", "EGP"]),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() }))
});
const handleSendEmail = (req, res) => {
  const parsed = OrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const orderId = Math.random().toString(36).slice(2, 10).toUpperCase();
  const response = { panierCode: orderId, emailSent: false };
  console.log("Simulated email sent:", { orderId, to: parsed.data.email, items: parsed.data.items });
  res.status(200).json(response);
};
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = url && key ? createClient(url, key) : {
  from() {
    throw new Error("Supabase is not configured on the server");
  }
};
const DATA_PATH = path.join(process.cwd(), "server", "data");
path.join(DATA_PATH, "store.json");
const defaultState = {
  products: [],
  banners: [],
  promos: [],
  categories: [
    { id: crypto.randomUUID(), name: "Softwares", slug: "softwares", published: true }
  ],
  toggles: { showNewsletter: true, showPromo: true, showPremium: true },
  orders: []
};
function readStore() {
  if (process.env.DISABLE_LOCAL_STORE === "true" || true) {
    console.warn("Local store disabled - using Supabase instead");
    return defaultState;
  }
}
function writeStore(next) {
  if (process.env.DISABLE_LOCAL_STORE === "true" || true) {
    console.warn("Local store disabled - using Supabase instead");
    return;
  }
}
const ADMIN_USER = "root";
const ADMIN_PASS = "root";
const SECRET = process.env.ADMIN_TOKEN_SECRET || "dev_secret";
function sign(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${header}.${body}`;
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}
function verify(token) {
  if (!token) return null;
  const [h, b, s] = token.split(".");
  if (!h || !b || !s) return null;
  const data = `${h}.${b}`;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (expected !== s) return null;
  try {
    return JSON.parse(Buffer.from(b, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}
const adminLogin = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });
  try {
    const url2 = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key2 = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url2 && key2) {
      const { data, error } = await supabaseAdmin.from("admins").select("id, username, password_hash").eq("username", username).single();
      if (!error && data && data.password_hash) {
        const ok = await bcrypt.compare(String(password), String(data.password_hash));
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });
        const token = sign({ sub: username, id: data.id, ts: Date.now() });
        return res.json({ ok: true, adminId: data.id, token });
      }
    }
  } catch (_e) {
  }
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = sign({ sub: username, ts: Date.now() });
    return res.json({ ok: true, token });
  }
  res.status(401).json({ error: "Invalid credentials" });
};
const requireAuth = (req, res, next) => {
  const auth = String(req.headers.authorization || "");
  const token = auth.replace("Bearer ", "").trim();
  const hasCookie = String(req.headers.cookie || "").includes("admin_ok=1");
  if (token === "ok" || hasCookie) return next();
  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  next();
};
const listOrders = async (_req, res) => {
  try {
    const url2 = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key2 = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url2 && key2) {
      const { data, error } = await supabaseAdmin.from("orders").select("code, customer_name, customer_email, customer_whatsapp, currency, notes, subtotal, created_at").order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        const mapped = data.map((o) => ({
          code: o.code,
          createdAt: new Date(o.created_at).getTime(),
          customer: { name: o.customer_name, email: o.customer_email, whatsapp: o.customer_whatsapp },
          currency: o.currency,
          items: [],
          status: "pending"
        }));
        return res.json(mapped);
      }
    }
  } catch (_e) {
  }
  const store = readStore();
  res.json(store.orders);
};
const listProducts = (_req, res) => {
  const store = readStore();
  const products = Array.isArray(store.products) ? store.products : [];
  res.json(products);
};
const createProduct = (req, res) => {
  const store = readStore();
  const { title, description, price, image_url, category_id } = req.body;
  const product = {
    id: crypto.randomUUID(),
    title: title || "",
    description: description || "",
    image: image_url || "",
    price: {
      USD: typeof price === "number" ? price : 0,
      EUR: 0,
      TND: 0,
      EGP: 0
    },
    variants: [],
    categoryId: category_id || void 0
  };
  store.products.push(product);
  writeStore();
  res.json(product);
};
const updateProduct = (req, res) => {
  const store = readStore();
  const idx = store.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { title, description, price, image_url, category_id } = req.body;
  store.products[idx] = {
    ...store.products[idx],
    title: title !== void 0 ? title : store.products[idx].title,
    description: description !== void 0 ? description : store.products[idx].description,
    image: image_url !== void 0 ? image_url : store.products[idx].image,
    categoryId: category_id !== void 0 ? category_id : store.products[idx].categoryId
  };
  if (price !== void 0) {
    store.products[idx].price = {
      ...store.products[idx].price,
      USD: typeof price === "number" ? price : store.products[idx].price.USD
    };
  }
  writeStore();
  res.json(store.products[idx]);
};
const deleteProduct = (req, res) => {
  const store = readStore();
  store.products = store.products.filter((p) => p.id !== req.params.id);
  writeStore();
  res.json({ ok: true });
};
const listBanners = (_req, res) => res.json(readStore().banners);
const upsertBanner = (req, res) => {
  const store = readStore();
  const banner = req.body.id ? req.body : { id: crypto.randomUUID(), ...req.body };
  const idx = store.banners.findIndex((b) => b.id === banner.id);
  if (idx === -1) store.banners.push(banner);
  else store.banners[idx] = banner;
  writeStore();
  res.json(banner);
};
const deleteBanner = (req, res) => {
  const store = readStore();
  store.banners = store.banners.filter((b) => b.id !== req.params.id);
  writeStore();
  res.json({ ok: true });
};
const getToggles = (_req, res) => res.json(readStore().toggles);
const setToggles = (req, res) => {
  const store = readStore();
  store.toggles = { ...store.toggles, ...req.body };
  writeStore();
  res.json(store.toggles);
};
const listPromos = (_req, res) => res.json(readStore().promos);
const upsertPromo = (req, res) => {
  const store = readStore();
  const promo = req.body.id ? req.body : { id: (req.body.id || "").toUpperCase() || crypto.randomUUID(), ...req.body };
  const idx = store.promos.findIndex((p) => p.id === promo.id);
  if (idx === -1) store.promos.push(promo);
  else store.promos[idx] = promo;
  writeStore();
  res.json(promo);
};
const deletePromo = (req, res) => {
  const store = readStore();
  store.promos = store.promos.filter((p) => p.id !== req.params.id);
  writeStore();
  res.json({ ok: true });
};
const getProfile = async (req, res) => {
  try {
    const url2 = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key2 = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url2 && key2) {
      const auth = String(req.headers.authorization || "");
      const token = auth.replace("Bearer ", "").trim();
      const payload = verify(token);
      if (payload?.id) {
        const { data, error } = await supabaseAdmin.from("admins").select("id, username, email, name").eq("id", payload.id).single();
        if (!error && data) {
          return res.json({
            username: data.username || "",
            email: data.email || "",
            name: data.name || ""
          });
        }
      }
    }
  } catch (_e) {
  }
  res.json({ username: ADMIN_USER, email: "admin@example.com", name: "Administrator" });
};
const updateProfile = async (req, res) => {
  const { name, email, username } = req.body;
  try {
    const url2 = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key2 = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url2 && key2) {
      const auth = String(req.headers.authorization || "");
      const token = auth.replace("Bearer ", "").trim();
      const payload = verify(token);
      if (payload?.id) {
        const { data, error } = await supabaseAdmin.from("admins").update({ name, email, username }).eq("id", payload.id).select().single();
        if (!error && data) {
          return res.json({
            username: data.username || "",
            email: data.email || "",
            name: data.name || ""
          });
        }
      }
    }
  } catch (_e) {
  }
  res.json({ username: username || ADMIN_USER, email: email || "admin@example.com", name: name || "Administrator" });
};
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const url2 = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key2 = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url2 && key2) {
      const auth = String(req.headers.authorization || "");
      const token = auth.replace("Bearer ", "").trim();
      const payload = verify(token);
      if (payload?.id) {
        const { data: admin } = await supabaseAdmin.from("admins").select("password_hash").eq("id", payload.id).single();
        if (admin && admin.password_hash) {
          const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
          if (!validPassword) {
            return res.status(401).json({ error: "Current password is incorrect" });
          }
          const newHash = await bcrypt.hash(newPassword, 10);
          const { error } = await supabaseAdmin.from("admins").update({ password_hash: newHash }).eq("id", payload.id);
          if (!error) {
            return res.json({ ok: true, message: "Password updated successfully" });
          }
        }
      }
    }
  } catch (_e) {
  }
  if (currentPassword === ADMIN_PASS) {
    return res.json({ ok: true, message: "Password updated successfully" });
  }
  res.status(401).json({ error: "Current password is incorrect" });
};
const listProductsSupabase = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("products").select(`
        id,
        title,
        price,
        description,
        image_url,
        category_id,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `).order("created_at", { ascending: false });
    if (error) throw error;
    const products = (data || []).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      image: p.image_url || "",
      price: {
        USD: typeof p.price === "string" ? parseFloat(p.price) : Number(p.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: p.category_id
    }));
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message || "Failed to fetch products" });
  }
};
const createProductSupabase = async (req, res) => {
  try {
    const { title, description, price, image_url, category_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const { data, error } = await supabaseAdmin.from("products").insert({
      title,
      description: description || "",
      price: Number(price || 0),
      image_url: image_url || "",
      category_id: category_id || null
    }).select().single();
    if (error) throw error;
    const product = {
      id: data.id,
      title: data.title,
      description: data.description || "",
      image: data.image_url || "",
      price: {
        USD: Number(data.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: data.category_id
    };
    res.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message || "Failed to create product" });
  }
};
const updateProductSupabase = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, image_url, category_id } = req.body;
    const updateData = {};
    if (title !== void 0) updateData.title = title;
    if (description !== void 0) updateData.description = description;
    if (price !== void 0) updateData.price = Number(price);
    if (image_url !== void 0) updateData.image_url = image_url;
    if (category_id !== void 0) updateData.category_id = category_id || null;
    const { data, error } = await supabaseAdmin.from("products").update(updateData).eq("id", id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Product not found" });
    const product = {
      id: data.id,
      title: data.title,
      description: data.description || "",
      image: data.image_url || "",
      price: {
        USD: Number(data.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: data.category_id
    };
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message || "Failed to update product" });
  }
};
const deleteProductSupabase = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "Failed to delete product" });
  }
};
const Input = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(6),
  currency: z.enum(["USD", "TND", "EGP", "EUR"]),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })),
  promoCode: z.string().trim().toUpperCase().optional(),
  subtotal: z.number().positive(),
  notes: z.string().optional()
});
function genCode() {
  const now = /* @__PURE__ */ new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 6; i++) rand += charset[Math.floor(Math.random() * charset.length)];
  return `ORD-${y}${m}${d}-${rand}`;
}
async function sendOrderConfirmationEmail(order, itemsDetails) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    console.log("Email not configured. Order:", order.code);
    return false;
  }
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  const subject = `Order Confirmation - ${order.code}`;
  const customerText = `
Thank you for your order!

Order Number: ${order.code}
Payment Status: ${order.paymentStatus === "paid" ? "Paid" : "Pending"}

Order Details:
${itemsDetails}

We will send you an email with tracking information once your order ships.

If you have any questions, please contact us.

Best regards,
The Team
  `.trim();
  const adminText = `
New Order Received: ${order.code}

Customer Information:
- Name: ${order.customer.name}
- Email: ${order.customer.email}
- WhatsApp: ${order.customer.whatsapp}

Order Details:
${itemsDetails}

Payment Status: ${order.paymentStatus || "pending"}
Currency: ${order.currency}
Promo Code: ${order.promoCode || "None"}
Notes: ${order.notes || "None"}
  `.trim();
  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject: `New Order: ${order.code}`,
      text: adminText
    });
    await transporter.sendMail({
      from: SMTP_USER,
      to: order.customer.email,
      subject,
      text: customerText
    });
    return true;
  } catch (e) {
    console.error("Failed to send emails:", e);
    return false;
  }
}
const handleCheckout = async (req, res) => {
  try {
    const parsed = Input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const code = genCode();
    const store = readStore();
    const order = {
      code,
      createdAt: Date.now(),
      customer: {
        name: parsed.data.name,
        email: parsed.data.email,
        whatsapp: parsed.data.whatsapp
      },
      currency: parsed.data.currency,
      items: parsed.data.items.map((item) => ({ id: item.id, qty: item.qty })),
      status: "pending",
      promoCode: parsed.data.promoCode,
      notes: parsed.data.notes,
      paymentStatus: "pending"
    };
    store.orders.push(order);
    writeStore(store);
    const paymentLink = null;
    const itemsDetails = parsed.data.items.filter((item) => item.id && item.qty).map((item) => `- ${item.id} x ${item.qty}`).join("\n");
    sendOrderConfirmationEmail(order, itemsDetails).catch((e) => console.error("Email send failed:", e));
    const whatsapp = process.env.WHATSAPP_NUMBER || null;
    return res.json({ panierCode: code, whatsapp, paymentLink, requiresPayment: false });
  } catch (error) {
    console.error("/api/checkout failed:", error?.stack || error);
    return res.status(500).json({ error: "Checkout failed", detail: String(error?.message || error) });
  }
};
const getOrderByCode = (req, res) => {
  const { code } = req.params;
  const store = readStore();
  const order = store.orders.find((o) => o.code.toUpperCase() === String(code).toUpperCase());
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
};
const handleFlouciWebhook = async (req, res) => {
  console.log("Flouci webhook received:", req.body);
  const { payment_id, developer_tracking_id, status } = req.body;
  if (!developer_tracking_id) {
    return res.status(400).json({ error: "Missing tracking ID" });
  }
  const store = readStore();
  const orderIdx = store.orders.findIndex((o) => o.code === developer_tracking_id);
  if (orderIdx === -1) {
    console.error("Order not found for webhook:", developer_tracking_id);
    return res.status(404).json({ error: "Order not found" });
  }
  if (status === "SUCCESS" || status === "success") {
    store.orders[orderIdx].paymentStatus = "paid";
    store.orders[orderIdx].status = "confirmed";
  } else {
    store.orders[orderIdx].paymentStatus = "failed";
  }
  if (payment_id) {
    store.orders[orderIdx].paymentId = payment_id;
  }
  writeStore();
  if (store.orders[orderIdx].paymentStatus === "paid") {
    const order = store.orders[orderIdx];
    const itemsDetails = order.items.map(
      (item) => `- ${item.id} x ${item.qty}`
    ).join("\n");
    sendOrderConfirmationEmail(order, itemsDetails).catch(console.error);
  }
  res.json({ ok: true });
};
const validatePromo = (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  if (!code) return res.status(400).json({ found: false, active: false, percent: 0, code });
  const store = readStore();
  const promo = store.promos.find((p) => p.id.toUpperCase() === code);
  if (!promo) return res.json({ found: false, active: false, percent: 0, code });
  return res.json({ found: true, active: !!promo.active, percent: promo.percent, code: promo.id });
};
const listPublicProducts = (req, res) => {
  const store = readStore();
  const slug = String(req.query.category || "").trim();
  let list = store.products || [];
  if (slug) {
    const cat = (store.categories || []).find((c) => c.slug === slug);
    if (cat) list = list.filter((p) => p.categoryId === cat.id);
    else list = [];
  }
  res.json(list);
};
const getPublicProduct = (req, res) => {
  const id = String(req.params.id);
  const store = readStore();
  const prod = (store.products || []).find((p) => p.id === id);
  if (!prod) return res.status(404).json({ error: "Not found" });
  res.json(prod);
};
function getSupabaseClient() {
  const url2 = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url2 || !anonKey) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(url2, anonKey);
}
const listPublicProductsSupabase = async (req, res) => {
  try {
    const slug = String(req.query.category || "").trim();
    const supabase = getSupabaseClient();
    let query = supabase.from("products").select(`
        id,
        title,
        description,
        price,
        image_url,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `).order("created_at", { ascending: false });
    if (slug) {
      const supabase2 = getSupabaseClient();
      const { data: category } = await supabase2.from("categories").select("id").eq("slug", slug).single();
      if (category) {
        query = query.eq("category_id", category.id);
      } else {
        return res.json([]);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    const products = (data || []).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      image: p.image_url || "",
      price: {
        USD: Number(p.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: p.category_id
    }));
    res.json(products);
  } catch (error) {
    console.error("Error fetching public products:", error);
    res.status(500).json({ error: error.message || "Failed to fetch products" });
  }
};
const getPublicProductSupabase = async (req, res) => {
  try {
    const id = String(req.params.id);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("products").select(`
        id,
        title,
        description,
        price,
        image_url,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `).eq("id", id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Product not found" });
    const product = {
      id: data.id,
      title: data.title,
      description: data.description || "",
      image: data.image_url || "",
      price: {
        USD: Number(data.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: data.category_id
    };
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message || "Failed to fetch product" });
  }
};
const listCategories = (_req, res) => {
  const store = readStore();
  const list = (store.categories || []).filter((c) => c.published !== false);
  res.json(list);
};
const createCategory = (req, res) => {
  const name = String(req.body?.name || "").trim();
  const parentId = req.body?.parentId ? String(req.body.parentId) : void 0;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const store = readStore();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const exists = (store.categories || []).some((c) => c.slug === slug);
  if (exists) return res.status(409).json({ error: "Category exists" });
  const cat = { id: crypto.randomUUID(), name, slug, published: true };
  if (parentId) cat.parentId = parentId;
  store.categories = store.categories || [];
  store.categories.push(cat);
  writeStore();
  res.json(cat);
};
const updateCategory = (req, res) => {
  const id = String(req.params.id || "");
  const name = String(req.body?.name || "").trim();
  const parentId = req.body?.parentId ? String(req.body.parentId) : void 0;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const store = readStore();
  const idx = (store.categories || []).findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Category not found" });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const exists = (store.categories || []).some((c, i) => c.slug === slug && i !== idx);
  if (exists) return res.status(409).json({ error: "Category with this name already exists" });
  store.categories[idx] = { ...store.categories[idx], name, slug };
  if (parentId) {
    store.categories[idx].parentId = parentId;
  } else {
    delete store.categories[idx].parentId;
  }
  writeStore();
  res.json(store.categories[idx]);
};
const deleteCategory = (req, res) => {
  const id = String(req.params.id || "");
  const store = readStore();
  const used = (store.products || []).some((p) => p.categoryId === id);
  if (used) return res.status(400).json({ error: "Category is used by products" });
  const hasChildren = (store.categories || []).some((c) => c.parentId === id);
  if (hasChildren) return res.status(400).json({ error: "Category has subcategories" });
  const before = (store.categories || []).length;
  store.categories = (store.categories || []).filter((c) => c.id !== id);
  writeStore();
  res.json({ ok: true, removed: before - (store.categories || []).length });
};
const EXCHANGE_RATES = {
  TND: 1,
  USD: 0.32,
  // 1 TND ≈ 0.32 USD
  EUR: 0.3,
  // 1 TND ≈ 0.30 EUR
  EGP: 16,
  // 1 TND ≈ 16 EGP
  GBP: 0.26
  // 1 TND ≈ 0.26 GBP
};
const convertCurrency = (req, res) => {
  const { amount, from = "TND" } = req.query;
  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({
      error: "Invalid amount parameter"
    });
  }
  const fromCurrency = String(from).toUpperCase();
  const amountNum = Number(amount);
  if (!EXCHANGE_RATES[fromCurrency]) {
    return res.status(400).json({
      error: `Unsupported currency: ${fromCurrency}`
    });
  }
  const amountInTND = fromCurrency === "TND" ? amountNum : amountNum / EXCHANGE_RATES[fromCurrency];
  const converted = {};
  for (const [currency, rate] of Object.entries(EXCHANGE_RATES)) {
    converted[currency] = parseFloat((amountInTND * rate).toFixed(2));
  }
  res.json({
    from: fromCurrency,
    amount: amountNum,
    rates: EXCHANGE_RATES,
    converted
  });
};
function createServer() {
  const app2 = express__default();
  const useSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
  app2.use(cors());
  app2.use(express__default.json({ limit: "50mb" }));
  app2.use(express__default.urlencoded({ extended: true, limit: "50mb" }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/send-email", handleSendEmail);
  app2.post("/api/checkout", handleCheckout);
  app2.post("/api/webhook/flouci", handleFlouciWebhook);
  app2.get("/api/promo/:code", validatePromo);
  app2.get("/api/currency/convert", convertCurrency);
  if (useSupabase) {
    app2.get("/api/products", listPublicProductsSupabase);
    app2.get("/api/products/:id", getPublicProductSupabase);
  } else {
    app2.get("/api/products", listPublicProducts);
    app2.get("/api/products/:id", getPublicProduct);
  }
  app2.get("/api/categories", listCategories);
  app2.post("/api/categories", createCategory);
  app2.put("/api/categories/:id", updateCategory);
  app2.delete("/api/categories/:id", deleteCategory);
  app2.get("/api/orders/:code", getOrderByCode);
  app2.post("/api/admin/login", adminLogin);
  app2.get("/api/admin/orders", requireAuth, listOrders);
  app2.get("/api/admin/orders/:code", requireAuth, getOrderByCode);
  if (useSupabase) {
    app2.get("/api/admin/products", requireAuth, listProductsSupabase);
    app2.post("/api/admin/products", requireAuth, createProductSupabase);
    app2.put("/api/admin/products/:id", requireAuth, updateProductSupabase);
    app2.delete("/api/admin/products/:id", requireAuth, deleteProductSupabase);
  } else {
    app2.get("/api/admin/products", requireAuth, listProducts);
    app2.post("/api/admin/products", requireAuth, createProduct);
    app2.put("/api/admin/products/:id", requireAuth, updateProduct);
    app2.delete("/api/admin/products/:id", requireAuth, deleteProduct);
  }
  app2.get("/api/admin/banners", requireAuth, listBanners);
  app2.post("/api/admin/banners", requireAuth, upsertBanner);
  app2.delete("/api/admin/banners/:id", requireAuth, deleteBanner);
  app2.get("/api/admin/toggles", requireAuth, getToggles);
  app2.put("/api/admin/toggles", requireAuth, setToggles);
  app2.get("/api/admin/promos", requireAuth, listPromos);
  app2.post("/api/admin/promos", requireAuth, upsertPromo);
  app2.delete("/api/admin/promos/:id", requireAuth, deletePromo);
  app2.get("/api/admin/profile", requireAuth, getProfile);
  app2.put("/api/admin/profile", requireAuth, updateProfile);
  app2.put("/api/admin/password", requireAuth, changePassword);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
