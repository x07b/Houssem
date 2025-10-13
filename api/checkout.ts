import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCheckout } from '../server/routes/checkout';

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

export default async function checkout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  // Delegate to the Express-compatible handler
  return (handleCheckout as any)(req as any, res as any);
}


