type RequestLike = {
  method?: string;
};

interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): void;
  setHeader?(name: string, value: string): void;
}

export default function handler(req: RequestLike, res: ResponseLike) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    if (res.setHeader) {
      res.setHeader("Allow", "GET,HEAD");
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  return res.status(200).json({ ok: true });
}
