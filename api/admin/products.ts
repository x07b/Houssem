export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    return res.status(200).end(JSON.stringify({ ok: true, route: "GET /api/admin/products" }));
  }

  if (req.method === "POST") {
    let body: any = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    if (!body || typeof body !== "object") body = {};
    return res.status(200).end(JSON.stringify({ ok: true, received: body }));
  }

  return res.status(405).end(JSON.stringify({ ok: false, error: "Method not allowed" }));
}
