import serverless from 'serverless-http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server/index';

// Initialize Express app once per runtime
const app = createServer();
const handler = serverless(app);

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function apiHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req as any, res as any);
}
