import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function verify(token: string | undefined) {
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return decoded;
  } catch {
    return null;
  }
}

function requireAuth(req: VercelRequest): boolean {
  const auth = String(req.headers.authorization || "");
  const token = auth.replace("Bearer ", "").trim();
  
  // Accept "ok" token from fallback auth
  if (token === "ok") return true;
  
  const payload = verify(token);
  return !!payload;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  if (!requireAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orderCode = req.query.code as string;
  if (!orderCode) {
    return res.status(400).json({ error: 'Order code is required' });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(url, key);

  try {
    // Fetch order by code with order items and product details
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        code,
        customer_name,
        customer_email,
        customer_whatsapp,
        currency,
        notes,
        subtotal,
        payment_status,
        created_at,
        order_items (
          id,
          qty,
          unit_price,
          line_total,
          products (
            id,
            title,
            price
          )
        )
      `)
      .eq('code', orderCode)
      .single();

    if (ordersError) {
      if (ordersError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Order not found' });
      }
      console.error('Supabase order lookup error:', ordersError);
      return res.status(500).json({ error: ordersError.message });
    }

    if (!orders) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Transform order to match the expected format
    const transformedOrder = {
      id: orders.id,
      code: orders.code,
      createdAt: new Date(orders.created_at).getTime(),
      customer: {
        name: orders.customer_name,
        email: orders.customer_email,
        whatsapp: orders.customer_whatsapp,
      },
      currency: orders.currency,
      notes: orders.notes,
      subtotal: orders.subtotal,
      paymentStatus: orders.payment_status,
      items: (orders.order_items || []).map((item: any) => ({
        id: item.products?.title || item.products?.id || 'Unknown Product',
        qty: item.qty,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
        productId: item.products?.id,
      })),
    };

    return res.json(transformedOrder);
  } catch (error: any) {
    console.error('Admin order lookup API error:', error);
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
