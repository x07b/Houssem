import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { Order } from '../shared/entities';

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

function looksLikeUUID(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default async function checkout(req: VercelRequest, res: VercelResponse) {
  console.log('api/checkout: handler started');
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    console.log('api/checkout: parsing payload');
    const parsed = PayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', detail: parsed.error.flatten() });
    }

    const code = genCode();
    console.log('api/checkout: generated code', code);

    // Optional: persist to local store (non-blocking, serverless-safe)
    try {
      const { readStore, writeStore } = await import('../server/store');
      const store = readStore();
      const order: Order = {
        code,
        createdAt: Date.now(),
        customer: {
          name: parsed.data.name,
          email: parsed.data.email,
          whatsapp: parsed.data.whatsapp,
        },
        currency: parsed.data.currency as any,
        items: parsed.data.items.map(i => ({ id: i.id, qty: i.qty })),
        status: 'pending',
        promoCode: undefined,
        notes: parsed.data.notes,
        paymentStatus: 'pending',
      };
      store.orders.push(order);
      writeStore(store);
      console.log('api/checkout: local store updated');
    } catch (e) {
      console.warn('api/checkout: local store write skipped (serverless)', e?.message);
    }

    // Optional: persist to Supabase if service role is present
    const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (hasSupabase) {
      try {
        console.log('api/checkout: writing to Supabase');
        const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);
        const { name, email, whatsapp, currency, items, notes, subtotal } = parsed.data;
        
        // Resolve product slugs to UUIDs
        const uuids = items.filter(i => looksLikeUUID(i.id)).map(i => i.id);
        const slugs = items.filter(i => !looksLikeUUID(i.id)).map(i => i.id);
        
        let products: Array<{ id: string; slug: string | null; price: number }> = [];
        
        if (uuids.length) {
          const { data, error } = await supabase
            .from('products')
            .select('id, slug, price')
            .in('id', uuids);
          if (error) throw error;
          products = products.concat(data || []);
        }
        
        if (slugs.length) {
          const { data, error } = await supabase
            .from('products')
            .select('id, slug, price')
            .in('slug', slugs);
          if (error) throw error;
          products = products.concat(data || []);
        }
        
        // Build lookup maps
        const byId = new Map(products.map(p => [p.id, p]));
        const bySlug = new Map(products.filter(p => p.slug).map(p => [p.slug as string, p]));
        
        // Resolve items to UUIDs and recompute total
        const resolvedItems: Array<{ product_id: string; qty: number; unit_price: number }> = [];
        let recomputedSubtotal = 0;
        
        for (const it of items) {
          const prod = looksLikeUUID(it.id) ? byId.get(it.id) : bySlug.get(it.id);
          if (!prod) {
            return res.status(400).json({ error: 'Unknown product', detail: `Item ${it.id} not found` });
          }
          const price = Number(prod.price || 0);
          recomputedSubtotal += price * it.qty;
          resolvedItems.push({ product_id: prod.id, qty: it.qty, unit_price: price });
        }
        
        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .insert({
            code,
            customer_name: name,
            customer_email: email,
            customer_whatsapp: whatsapp,
            currency,
            notes,
            subtotal: recomputedSubtotal,
            requires_payment: false,
            payment_status: 'pending',
          })
          .select()
          .single();
        if (orderErr) throw orderErr;

        // Insert order items with resolved UUIDs
        const itemsPayload = resolvedItems.map((it) => ({
          order_id: order.id,
          product_id: it.product_id,
          qty: it.qty,
          unit_price: it.unit_price,
        }));
        const { error: oiErr } = await supabase.from('order_items').insert(itemsPayload);
        if (oiErr) throw oiErr;
        
        console.log('api/checkout: Supabase order created', order.id);
      } catch (e) {
        console.error('api/checkout: Supabase write failed', e?.message || e);
        // continue; do not fail the response
      }
    }

    console.log('api/checkout: returning success');
    return res.status(200).json({ panierCode: code, requiresPayment: false, paymentLink: null });
  } catch (error: any) {
    console.error('api/checkout: handler error', error?.stack || error);
    return res.status(500).json({ error: 'A server error has occurred', detail: String(error?.message || error) });
  }
}


