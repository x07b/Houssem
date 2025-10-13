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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(url, key);

  try {
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Fetch orders with order items and product details
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      console.error('Supabase orders error:', ordersError);
      return res.status(500).json({ error: ordersError.message });
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Supabase count error:', countError);
      return res.status(500).json({ error: countError.message });
    }

    // Transform orders to match the expected format
    const transformedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      code: order.code,
      createdAt: new Date(order.created_at).getTime(),
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        whatsapp: order.customer_whatsapp,
      },
      currency: order.currency,
      notes: order.notes,
      subtotal: order.subtotal,
      paymentStatus: order.payment_status,
      items: (order.order_items || []).map((item: any) => ({
        id: item.products?.title || item.products?.id || 'Unknown Product',
        qty: item.qty,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
        productId: item.products?.id,
      })),
    }));

    return res.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin orders API error:', error);
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}

