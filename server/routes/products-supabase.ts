import { RequestHandler } from "express";
import { supabaseAdmin } from "../supabase";
import crypto from "crypto";

// List all products for admin
export const listProductsSupabase: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        id,
        title,
        price,
        description,
        image_url,
        category_id,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform to AdminProduct format
    const products = (data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description || "",
      image: p.image_url || "",
      price: {
        USD: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price || 0),
        EUR: 0,
        TND: 0,
        EGP: 0
      },
      variants: [],
      categoryId: p.category_id,
    }));

    res.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message || "Failed to fetch products" });
  }
};

// Create product
export const createProductSupabase: RequestHandler = async (req, res) => {
  try {
    const { title, description, price, image_url, category_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        title,
        description: description || "",
        price: Number(price || 0),
        image_url: image_url || "",
        category_id: category_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Return in AdminProduct format
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
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message || "Failed to create product" });
  }
};

// Update product
export const updateProductSupabase: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, image_url, category_id } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (image_url !== undefined) updateData.image_url = image_url;
    if (category_id !== undefined) updateData.category_id = category_id || null;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Product not found" });

    // Return in AdminProduct format
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
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message || "Failed to update product" });
  }
};

// Delete product
export const deleteProductSupabase: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ ok: true });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "Failed to delete product" });
  }
};

