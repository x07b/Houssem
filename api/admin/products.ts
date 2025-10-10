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

function parseBody(req: VercelRequest): any {
  const b: any = (req as any).body;
  if (!b) return {};
  if (typeof b === 'string') {
    try { return JSON.parse(b); } catch { return {}; }
  }
  return b;
}

function validatePayload(payload: any) {
  const errors: string[] = [];
  const out: any = {};

  if (typeof payload.title !== 'string' || payload.title.trim() === '') {
    errors.push('title is required');
  } else out.title = payload.title.trim();

  if (payload.description == null) out.description = '';
  else if (typeof payload.description !== 'string') errors.push('description must be a string');
  else out.description = payload.description;

  const priceVal = payload.price;
  if (typeof priceVal !== 'number' || Number.isNaN(priceVal)) errors.push('price must be a number');
  else out.price = priceVal;

  if (payload.image_url == null) out.image_url = '';
  else if (typeof payload.image_url !== 'string') errors.push('image_url must be a string');
  else out.image_url = payload.image_url;

  if (payload.category_id == null || payload.category_id === '') out.category_id = null;
  else if (typeof payload.category_id !== 'string') errors.push('category_id must be a string');
  else out.category_id = payload.category_id;

  return { errors, out };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always JSON
  res.setHeader('Content-Type', 'application/json');

  // Preflight
  if (req.method === 'OPTIONS') return res.status(204).end();

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e: any) {
    return json(res, 500, { ok: false, error: 'Server not configured' });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('id,title,description,price,image_url,category_id,created_at')
        .order('created_at', { ascending: false });
      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 200, data || []);
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const { errors, out } = validatePayload(body);
      if (errors.length) return json(res, 400, { ok: false, error: errors.join(', ') });

      const { data, error } = await supabase
        .from('products')
        .insert({
          title: out.title,
          description: out.description,
          price: out.price,
          image_url: out.image_url,
          category_id: out.category_id,
        })
        .select('id,title,description,price,image_url,category_id,created_at')
        .single();
      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 201, data);
    }

    if (req.method === 'PUT') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return json(res, 400, { ok: false, error: 'id is required' });
      const { errors, out } = validatePayload(body);
      if (errors.length) return json(res, 400, { ok: false, error: errors.join(', ') });

      const { data, error } = await supabase
        .from('products')
        .update({
          title: out.title,
          description: out.description,
          price: out.price,
          image_url: out.image_url,
          category_id: out.category_id,
        })
        .eq('id', id)
        .select('id,title,description,price,image_url,category_id,created_at')
        .single();
      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 200, data);
    }

    if (req.method === 'DELETE') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return json(res, 400, { ok: false, error: 'id is required' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return json(res, 500, { ok: false, error: error.message });
      res.status(204).end();
      return;
    }

    return json(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (e: any) {
    return json(res, 500, { ok: false, error: 'Server error' });
  }
}
