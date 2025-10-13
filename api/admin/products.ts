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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    // GET - List all products
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          slug,
          title,
          description,
          image_url,
          price,
          sku,
          in_stock,
          category_id,
          created_at,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Transform to match AdminProduct interface
      const products = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        image: p.image_url,
        price: { USD: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price || 0), EUR: 0, TND: 0, EGP: 0 },
        categoryId: p.category_id,
        sku: p.sku,
        inStock: !!p.in_stock,
      }));

      return res.json(products);
    }

    // POST - Create new product
    if (req.method === 'POST') {
      const body = req.body;
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: body.title,
          slug: (body.slug || String(body.title || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          description: body.description || '',
          image_url: body.image || '',
          price: Number(body.price || 0),
          sku: body.sku || null,
          in_stock: body.inStock !== false,
          category_id: body.categoryId || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({
        id: data.id,
        title: data.title,
        description: data.description || '',
        image: data.image_url || '',
        price: { USD: Number(data.price || 0), EUR: 0, TND: 0, EGP: 0 },
        variants: [],
        categoryId: data.category_id,
        sku: data.sku,
        inStock: !!data.in_stock,
      });
    }

    // PUT - Update product (requires ID in query)
    if (req.method === 'PUT') {
      const id = req.query.id as string;
      
      if (!id) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      const body = req.body;
      
      const { data, error } = await supabase
        .from('products')
        .update({
          title: body.title,
          slug: (body.slug || String(body.title || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          description: body.description,
          image_url: body.image,
          price: Number(body.price || 0),
          sku: body.sku || null,
          in_stock: body.inStock !== false,
          category_id: body.categoryId || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({
        id: data.id,
        title: data.title,
        description: data.description || '',
        image: data.image_url || '',
        price: { USD: Number(data.price || 0), EUR: 0, TND: 0, EGP: 0 },
        variants: [],
        categoryId: data.category_id,
        sku: data.sku,
        inStock: !!data.in_stock,
      });
    }

    // DELETE - Delete product
    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      
      if (!id) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

