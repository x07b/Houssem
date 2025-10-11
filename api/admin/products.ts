// api/admin/products.ts
export default async function handler(req: Request) {
  if (req.method === "GET") {
    return new Response(JSON.stringify({ ok: true, route: "GET /api/admin/products" }), {
      headers: { "content-type": "application/json" },
    });
  }
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: true, received: body }), {
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "content-type": "application/json" },
  });
}
