import { RequestHandler } from "express";
import { z } from "zod";
import { readStore, writeStore } from "../store";
import { Order } from "@shared/entities";
// dynamic import nodemailer only if SMTP is configured

const Input = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(6),
  currency: z.enum(["USD","TND","EGP","EUR"]),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })),
  promoCode: z.string().trim().toUpperCase().optional(),
  notes: z.string().max(1000).optional(),
});

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i=0;i<6;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return `ORD-${s}`;
}

async function sendEmails(order: Order) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    console.log("Email not configured. Order:", order);
    return false;
  }
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const itemsList = order.items.map(i=>`- ${i.id} x${i.qty}`).join("\n");
  const userSubject = `🎉 Your Order Confirmation – Panier Code: ${order.code}`;
  const userBody = `Hi ${order.customer.name},\n\nThank you for your purchase at Your Store Name! 🎮✨\n\nHere are your order details:\nPanier Code: ${order.code}\nItems Ordered:\n${itemsList}\n\nYour Info:\nFull Name: ${order.customer.name}\nEmail: ${order.customer.email}\nPhone: ${order.customer.whatsapp}\nNotes: ${order.notes ?? "-"}\n\n🔑 You’ll receive your digital product codes by email once the order is processed. If you have any questions, simply reply to this email.\n\nThanks for shopping with us,\nYour Store Name Team`;
  const adminSubject = `📥 New Order Received – Panier Code: ${order.code}`;
  const adminBody = `Hello Admin,\n\nA new order has been placed on your store.\n\nPanier Code: ${order.code}\nItems Ordered:\n${itemsList}\n\nCustomer Details:\nFull Name: ${order.customer.name}\nEmail: ${order.customer.email}\nPhone: ${order.customer.whatsapp}\nNotes: ${order.notes ?? "-"}\n\n⚡ Please process this order and deliver the digital products.\n\nBest,\nYour System`;
  await transporter.sendMail({ from: SMTP_USER, to: ADMIN_EMAIL, subject: adminSubject, text: adminBody });
  await transporter.sendMail({ from: SMTP_USER, to: order.customer.email, subject: userSubject, text: userBody });
  return true;
}

export const handleCheckout: RequestHandler = async (req, res) => {
  const parsed = Input.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const code = genCode();
  const store = readStore();
  const order: Order = {
    code,
    createdAt: Date.now(),
    customer: { name: parsed.data.name, email: parsed.data.email, whatsapp: parsed.data.whatsapp },
    currency: parsed.data.currency,
    items: parsed.data.items as Order["items"],
    status: "pending",
    promoCode: parsed.data.promoCode,
    notes: parsed.data.notes,
  };
  store.orders.push(order);
  writeStore(store);
  const emailSent = await sendEmails(order).catch(()=>false);
  const whatsapp = process.env.WHATSAPP_NUMBER || null;
  res.json({ code, whatsapp, emailSent });
};

export const getOrderByCode: RequestHandler = (req, res) => {
  const { code } = req.params;
  const store = readStore();
  const order = store.orders.find(o=>o.code.toUpperCase() === String(code).toUpperCase());
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
};
