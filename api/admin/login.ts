import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from "bcryptjs";
import { createClient } from '@supabase/supabase-js';

const SECRET = process.env.ADMIN_TOKEN_SECRET || "dev_secret";

function sign(payload: any) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  
  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // Try Supabase authentication
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (url && key) {
      const supabase = createClient(url, key);
      
      const { data, error } = await supabase
        .from("admins")
        .select("id, username, password_hash")
        .eq("username", username)
        .single();

      if (!error && data && data.password_hash) {
        const ok = await bcrypt.compare(String(password), String(data.password_hash));
        
        if (!ok) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const token = sign({ sub: username, id: data.id, ts: Date.now() });
        return res.json({ ok: true, adminId: data.id, token });
      }
    }
  } catch (err) {
    console.error("Supabase auth error:", err);
  }

  // Fallback to local development credentials
  if (username === "root" && password === "root") {
    const token = sign({ sub: username, ts: Date.now() });
    return res.json({ ok: true, token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
}

