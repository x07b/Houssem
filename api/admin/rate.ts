import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function isAuthed(req: VercelRequest): boolean {
  const auth = String(req.headers.authorization || "");
  const token = auth.replace("Bearer ", "").trim();
  return !!token && token !== "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return res.status(500).json({ error: 'Supabase not configured' });
  const supabase = createClient(url, key);

  const SETTINGS_KEY = 'usd_tnd_rate';

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('settings').select('value, updated_at').eq('key', SETTINGS_KEY).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    const usdToTnd = data ? Number(data.value) : 0;
    return res.json({ usdToTnd: usdToTnd || 0, updatedAt: data?.updated_at || null });
  }

  if (req.method === 'PUT') {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    const usdToTnd = Number((req.body as any)?.usdToTnd);
    if (!usdToTnd || usdToTnd <= 0) return res.status(400).json({ error: 'Invalid rate' });
    const { error } = await supabase.from('settings').upsert({ key: SETTINGS_KEY, value: String(usdToTnd) }, { onConflict: 'key' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, usdToTnd });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


