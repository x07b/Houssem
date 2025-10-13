import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(url, anonKey);

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        image_url,
        price,
        discount_percent,
        variants,
        category_id,
        published,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Transform to match expected format
    const products = (data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      image: p.image_url,
      price: p.price,
      discountPercent: p.discount_percent || 0,
      variants: p.variants || [],
      categoryId: p.category_id,
      category: p.categories ? {
        id: p.categories.id,
        name: p.categories.name,
        slug: p.categories.slug,
      } : null,
    }));

    return res.json(products);
  } catch (err: any) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

