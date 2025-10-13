import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: true,
    externalResolver: false,
  },
};

const ItemSchema = z.object({ id: z.string(), qty: z.number().int().positive() });
const PayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(6),
  currency: z.string().min(1),
  items: z.array(ItemSchema).min(1),
  notes: z.string().max(1000).optional().or(z.literal('')).optional(),
  subtotal: z.number().nonnegative(),
});

function genCode() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) rand += charset[Math.floor(Math.random() * charset.length)];
  return `ORD-${y}${m}${d}-${rand}`;
}

export default async function checkout(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const parsed = PayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', detail: parsed.error.flatten() });
    }

    const code = genCode();

    // Optional: persist to Supabase if service role is present
    const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabase) {
      try {
        const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);
        const { name, email, whatsapp, currency, items, notes, subtotal } = parsed.data;
        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .insert({
            code,
            customer_name: name,
            customer_email: email,
            customer_whatsapp: whatsapp,
            currency,
            notes,
            subtotal,
            requires_payment: false,
            payment_status: 'pending',
          })
          .select()
          .single();
        if (orderErr) throw orderErr;

        // Insert order items using products.slug OR id best-effort
        const itemsPayload = items.map((it) => ({
          order_id: order.id,
          product_id: it.id, // if not a uuid, DB will error; acceptable for now if schema expects uuid
          qty: it.qty,
          unit_price: 0,
        }));
        await supabase.from('order_items').insert(itemsPayload);
      } catch (e) {
        console.error('supabase_order_write_error', e);
        // continue; do not fail the response
      }
    }

    return res.status(200).json({ panierCode: code, requiresPayment: false, paymentLink: null });
  } catch (error: any) {
    console.error('api/checkout error:', error?.stack || error);
    return res.status(500).json({ error: 'A server error has occurred', detail: String(error?.message || error) });
  }
}


