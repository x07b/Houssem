import serverless from 'serverless-http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { handleCheckout } from '../server/routes/checkout';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const app = express();
app.use(express.json({ limit: '10mb' }));
app.post('/api/checkout', handleCheckout);

const handler = serverless(app);

export default function checkout(req: VercelRequest, res: VercelResponse) {
  return handler(req as any, res as any);
}


