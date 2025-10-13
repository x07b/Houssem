import { RequestHandler } from "express";
import { z } from "zod";
import { readStore, writeStore } from "../store";
import { Order } from "@shared/entities";

const Input = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(6),
  currency: z.enum(["USD","TND","EGP","EUR"]),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })),
  promoCode: z.string().trim().toUpperCase().optional(),
  subtotal: z.number().positive(),
  notes: z.string().optional(),
});

function genCode() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 6; i++) rand += charset[Math.floor(Math.random() * charset.length)];
  return `ORD-${y}${m}${d}-${rand}`;
}

async function sendOrderConfirmationEmail(order: Order, itemsDetails: string) {
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
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  
  const subject = `Order Confirmation - ${order.code}`;
  const customerText = `
Thank you for your order!

Order Number: ${order.code}
Payment Status: ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}

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

Payment Status: ${order.paymentStatus || 'pending'}
Currency: ${order.currency}
Promo Code: ${order.promoCode || 'None'}
Notes: ${order.notes || 'None'}
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

async function initiateFlouciPayment(amount: number, orderCode: string) {
  const { FLOUCI_PUBLIC_KEY, FLOUCI_PRIVATE_KEY } = process.env;
  
  if (!FLOUCI_PUBLIC_KEY || !FLOUCI_PRIVATE_KEY) {
    console.log("Flouci not configured, skipping payment");
    return null;
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:8080";
  
  // Convert amount to millimes (TND * 1000)
  const amountInMillimes = Math.round(amount * 1000);
  
  const payload = {
    amount: amountInMillimes,
    success_link: `${baseUrl}/order-success?code=${orderCode}`,
    fail_link: `${baseUrl}/checkout?error=payment_failed`,
    webhook: `${baseUrl}/api/webhook/flouci`,
    developer_tracking_id: orderCode,
  };

  try {
    const response = await fetch("https://developers.flouci.com/api/v2/generate_payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FLOUCI_PUBLIC_KEY}:${FLOUCI_PRIVATE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Flouci payment failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Flouci API error:", error);
    return null;
  }
}

export const handleCheckout: RequestHandler = async (req, res) => {
  try {
    const parsed = Input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const code = genCode();
    const store = readStore();

    const order: Order = {
      code,
      createdAt: Date.now(),
      customer: {
        name: parsed.data.name,
        email: parsed.data.email,
        whatsapp: parsed.data.whatsapp,
      },
      currency: parsed.data.currency,
      items: parsed.data.items.map((item) => ({ id: item.id, qty: item.qty })),
      status: "pending",
      promoCode: parsed.data.promoCode,
      notes: parsed.data.notes,
      paymentStatus: "pending",
    };

    store.orders.push(order);
    writeStore(store);

    // Initiate Flouci payment if amount > 0 and currency is TND
    let paymentLink = null as string | null;
    if (parsed.data.subtotal > 0 && parsed.data.currency === "TND") {
      const flouciResponse = await initiateFlouciPayment(parsed.data.subtotal, code);
      if (flouciResponse?.payment_url) {
        paymentLink = flouciResponse.payment_url as string;
        // Store payment ID in order
        const updatedStore = readStore();
        const orderIdx = updatedStore.orders.findIndex((o) => o.code === code);
        if (orderIdx !== -1) {
          updatedStore.orders[orderIdx].paymentId = flouciResponse.payment_id || flouciResponse.id;
          writeStore(updatedStore);
        }
      }
    }

    // Prepare items details for email
    const itemsDetails = parsed.data.items
      .filter((item) => item.id && item.qty)
      .map((item) => `- ${item.id} x ${item.qty}`)
      .join("\n");

    // Send confirmation emails (async, don't wait)
    sendOrderConfirmationEmail(order, itemsDetails).catch((e) => console.error("Email send failed:", e));

    const whatsapp = process.env.WHATSAPP_NUMBER || null;
    return res.json({ panierCode: code, whatsapp, paymentLink, requiresPayment: !!paymentLink });
  } catch (error: any) {
    console.error("/api/checkout failed:", error?.stack || error);
    return res.status(500).json({ error: "Checkout failed", detail: String(error?.message || error) });
  }
};

export const getOrderByCode: RequestHandler = (req, res) => {
  const { code } = req.params;
  const store = readStore();
  const order = store.orders.find(o=>o.code.toUpperCase() === String(code).toUpperCase());
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
};

// Flouci webhook handler
export const handleFlouciWebhook: RequestHandler = async (req, res) => {
  console.log("Flouci webhook received:", req.body);
  
  const { payment_id, developer_tracking_id, status } = req.body;
  
  if (!developer_tracking_id) {
    return res.status(400).json({ error: "Missing tracking ID" });
  }

  const store = readStore();
  const orderIdx = store.orders.findIndex(o => o.code === developer_tracking_id);
  
  if (orderIdx === -1) {
    console.error("Order not found for webhook:", developer_tracking_id);
    return res.status(404).json({ error: "Order not found" });
  }

  // Update order payment status
  if (status === "SUCCESS" || status === "success") {
    store.orders[orderIdx].paymentStatus = "paid";
    store.orders[orderIdx].status = "confirmed";
  } else {
    store.orders[orderIdx].paymentStatus = "failed";
  }
  
  if (payment_id) {
    store.orders[orderIdx].paymentId = payment_id;
  }

  writeStore(store);

  // Send confirmation email if payment succeeded
  if (store.orders[orderIdx].paymentStatus === "paid") {
    const order = store.orders[orderIdx];
    const itemsDetails = order.items.map(item => 
      `- ${item.id} x ${item.qty}`
    ).join("\n");
    sendOrderConfirmationEmail(order, itemsDetails).catch(console.error);
  }

  res.json({ ok: true });
};
