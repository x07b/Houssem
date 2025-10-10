import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function json(res: VercelResponse, status: number, body: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify(body));
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !service) throw new Error('Missing Supabase env');
  return createClient(url, service);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'DELETE') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const id = String(req.query.id || '').trim();
  if (!id) return json(res, 400, { ok: false, error: 'id is required' });

  let supabase;
  try { supabase = getSupabaseAdmin(); } catch {
    return json(res, 500, { ok: false, error: 'Server not configured' });
  }

  try {
    const countResp = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    const count = (countResp as any).count as number | null;
    if ((count ?? 0) > 0) {
      return json(res, 409, { ok: false, message: 'Category in use' });
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return json(res, 500, { ok: false, error: error.message });

    res.status(204).end();
  } catch (e: any) {
    return json(res, 500, { ok: false, error: 'Server error' });
  }
}
