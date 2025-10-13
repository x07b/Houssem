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
    // Get current date and 7 days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get total orders count
    const { count: totalOrders, error: ordersCountError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersCountError) {
      console.error('Orders count error:', ordersCountError);
      return res.status(500).json({ error: ordersCountError.message });
    }

    // Get unique customers count
    const { data: uniqueCustomers, error: customersError } = await supabase
      .from('orders')
      .select('customer_email')
      .not('customer_email', 'is', null);

    if (customersError) {
      console.error('Customers count error:', customersError);
      return res.status(500).json({ error: customersError.message });
    }

    const uniqueCustomerEmails = new Set((uniqueCustomers || []).map(c => c.customer_email)).size;

    // Get products count
    const { count: totalProducts, error: productsCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsCountError) {
      console.error('Products count error:', productsCountError);
      return res.status(500).json({ error: productsCountError.message });
    }

    // Get recent activity (orders in last 7 days vs prior 7 days)
    const { count: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (recentOrdersError) {
      console.error('Recent orders count error:', recentOrdersError);
      return res.status(500).json({ error: recentOrdersError.message });
    }

    const { count: priorOrders, error: priorOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString());

    if (priorOrdersError) {
      console.error('Prior orders count error:', priorOrdersError);
      return res.status(500).json({ error: priorOrdersError.message });
    }

    // Calculate growth percentage
    const growthPercentage = priorOrders > 0 
      ? Math.round(((recentOrders || 0) - (priorOrders || 0)) / (priorOrders || 1) * 100)
      : (recentOrders || 0) > 0 ? 100 : 0;

    return res.json({
      totalOrders: totalOrders || 0,
      uniqueCustomers: uniqueCustomerEmails,
      totalProducts: totalProducts || 0,
      recentOrders: recentOrders || 0,
      priorOrders: priorOrders || 0,
      growthPercentage,
    });
  } catch (error: any) {
    console.error('Admin metrics API error:', error);
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
