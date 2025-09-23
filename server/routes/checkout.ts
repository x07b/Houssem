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
});

function genCode() {
  const n = Math.floor(10000 + Math.random()*89999);
  return `PNR-${n}`;
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
  const subject = `Order ${order.code}`;
  const txt = `Order ${order.code}\nCustomer: ${order.customer.name}\nEmail: ${order.customer.email}\nWhatsApp: ${order.customer.whatsapp}\nCurrency: ${order.currency}\nPromo: ${order.promoCode ?? "-"}\nItems:\n${itemsList}`;
  await transporter.sendMail({ from: SMTP_USER, to: ADMIN_EMAIL, subject, text: txt });
  await transporter.sendMail({ from: SMTP_USER, to: order.customer.email, subject, text: `Thank you! Use code ${order.code}.\n\n${txt}` });
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
    items: parsed.data.items,
    status: "pending",
    promoCode: parsed.data.promoCode,
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
