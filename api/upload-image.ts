import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return res.status(500).json({ error: 'Supabase not configured' });
  const supabase = createClient(url, key);

  const { fileBase64 } = req.body as any;
  if (!fileBase64 || typeof fileBase64 !== 'string') return res.status(400).json({ error: 'fileBase64 required' });

  const match = fileBase64.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return res.status(400).json({ error: 'Invalid base64' });
  const mime = match[1];
  const b64 = match[2];
  const buf = Buffer.from(b64, 'base64');
  const ext = mime.split('/')[1] || 'png';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Ensure bucket exists (idempotent)
  try { await (supabase as any).storage.createBucket('assets', { public: true }); } catch {}

  const { error: upErr } = await supabase.storage.from('assets').upload(path, buf, { contentType: mime, upsert: false });
  if (upErr) return res.status(500).json({ error: upErr.message });
  const { data: pub } = supabase.storage.from('assets').getPublicUrl(path);
  return res.json({ url: pub.publicUrl });
}


