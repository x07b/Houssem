type RequestLike = {
  method?: string;
  body?: unknown;
  query?: Record<string, unknown>;
};

interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): void;
  setHeader?(name: string, value: string): void;
}

function normalizePayload(value: unknown): unknown {
  if (value == null) {
    return {};
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { raw: value };
    }
  }

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
    try {
      return JSON.parse(value.toString("utf8"));
    } catch {
      return { raw: value.toString("utf8") };
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return { value };
}

export default function handler(req: RequestLike, res: ResponseLike) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      method: "GET",
      message: "Admin products API",
      query: req.query ?? {},
    });
  }

  if (req.method === "POST") {
    const payload = normalizePayload(req.body);
    return res.status(200).json({
      ok: true,
      method: "POST",
      message: "Admin products API",
      data: payload,
    });
  }

  if (res.setHeader) {
    res.setHeader("Allow", "GET,POST");
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
