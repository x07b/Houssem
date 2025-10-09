import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE! || process.env.SUPABASE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const { data: admin, error } = await supabase
    .from('admins')
    .select('password_hash')
    .eq('username', username)
    .single();

  if (error || !admin) return res.status(401).json({ error: 'Invalid username or password' });

  const ok = await bcrypt.compare(password, admin.password_hash as string);
  if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

  return res.status(200).json({ ok: true });
}
