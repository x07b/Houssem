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

  // For now, return empty orders array
  // In production, this would query Supabase orders table
  return res.json([]);
}

