import serverless from 'serverless-http';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createServer } from '../../server/index';

const app = createServer();
const handler = serverless(app);

export const handlerFn: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return handler(event as any, context as any);
};

// Netlify expects a named export `handler`
export const handler = handlerFn;
