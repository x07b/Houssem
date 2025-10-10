import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization')
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !service) throw new Error('Missing Supabase env')
  return createClient(url, service)
}

export default async function handler(req: any, res: any) {
  setCors(res)

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
      hasService: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    let body: any = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch (_) { body = {} }
    }
    const { username, password } = body || {}
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Missing credentials' })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, password_hash')
      .eq('username', username)
      .single()

    if (error || !data) {
      return res.status(401).json({ ok: false, error: 'Invalid username or password' })
    }

    const ok = await bcrypt.compare(password, data.password_hash)
    if (!ok) {
      return res.status(401).json({ ok: false, error: 'Invalid username or password' })
    }

    const maxAge = 60 * 60 * 8 // 8 hours
    res.setHeader(
      'Set-Cookie',
      `admin_ok=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`
    )

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    console.error('ADMIN_LOGIN_ERROR', e?.message || e)
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
}
