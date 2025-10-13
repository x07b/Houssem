import serverless from "serverless-http";
import type { Handler } from "@netlify/functions";
import { createServer } from "../../server";

// Initialize Express app once per runtime
const app = createServer();
const handler = serverless(app);

export const handlerNetlify: Handler = async (event, context) => {
  // Netlify expects a default export named handler
  // serverless-http supports Netlify proxy format
  // @ts-ignore
  return handler(event, context);
};

export const handler = handlerNetlify;


