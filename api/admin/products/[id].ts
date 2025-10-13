import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function requireAuth(req: VercelRequest): boolean {
  const auth = String(req.headers.authorization || "");
  const token = auth.replace("Bearer ", "").trim();
  return !!token && token !== "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: 'Supabase not configured' });
  const supabase = createClient(url, key);

  const id = (req.query as any).id as string;
  if (!id) return res.status(400).json({ error: 'Product ID required' });

  try {
    if (req.method === 'PUT') {
      const body = req.body as any;
      const { data, error } = await supabase
        .from('products')
        .update({
          title: body.title,
          description: body.description || '',
          image_url: body.image_url || '',
          price: Number(body.price || 0),
          category_id: body.category_id || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.json({
        id: data.id,
        title: data.title,
        description: data.description || '',
        image: data.image_url || '',
        price: { USD: Number(data.price || 0), EUR: 0, TND: 0, EGP: 0 },
        variants: [],
        categoryId: data.category_id,
      });
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}


