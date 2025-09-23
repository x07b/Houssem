import { RequestHandler } from "express";
import { OrderRequest, OrderResponse } from "@shared/api";
import { z } from "zod";

const OrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(6),
  currency: z.enum(["USD", "TND", "EGP"]),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })),
});

export const handleSendEmail: RequestHandler = (req, res) => {
  const parsed = OrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const orderId = Math.random().toString(36).slice(2, 10).toUpperCase();
  const response: OrderResponse = { orderId, delivered: true };
  // Placeholder: Here we could integrate nodemailer to actually send email with codes.
  console.log("Simulated email sent:", { orderId, to: parsed.data.email, items: parsed.data.items });
  res.status(200).json(response);
};
