import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

// Create public Supabase client (uses anon key for RLS)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(url, anonKey);
}

export const listPublicProductsSupabase: RequestHandler = async (req, res) => {
  try {
    const slug = String(req.query.category || "").trim();
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from("products")
      .select(`
        id,
        title,
        description,
        price,
        image_url,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .order("created_at", { ascending: false });

    // Filter by category if slug provided
    if (slug) {
      const supabase2 = getSupabaseClient();
      const { data: category } = await supabase2
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .single();
      
      if (category) {
        query = query.eq("category_id", category.id);
      } else {
        return res.json([]);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to AdminProduct format
    const products = (data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      image: p.image_url || "",
      price: {
        USD: Number(p.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: p.category_id,
    }));

    res.json(products);
  } catch (error: any) {
    console.error("Error fetching public products:", error);
    res.status(500).json({ error: error.message || "Failed to fetch products" });
  }
};

export const getPublicProductSupabase: RequestHandler = async (req, res) => {
  try {
    const id = String(req.params.id);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        title,
        description,
        price,
        image_url,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Product not found" });

    // Transform to AdminProduct format
    const product = {
      id: data.id,
      title: data.title,
      description: data.description || "",
      image: data.image_url || "",
      price: {
        USD: Number(data.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: data.category_id,
    };

    res.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message || "Failed to fetch product" });
  }
};

