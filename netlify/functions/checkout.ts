import type { Handler } from "@netlify/functions";
import express from "express";
import serverless from "serverless-http";
import { handleCheckout } from "../../server/routes/checkout";

const app = express();
app.use(express.json({ limit: "10mb" }));
// Support both function path and site path
app.post("/api/checkout", handleCheckout);
app.post("/.netlify/functions/checkout", handleCheckout);
app.post("/", handleCheckout);

const handler = serverless(app);

export const handlerNetlify: Handler = async (event, context) => {
  // Route both "/" and "/api/checkout" to the same handler for convenience
  if (event.path.endsWith("/checkout") && event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST" }, body: JSON.stringify({ error: "Method Not Allowed" }) } as any;
  }
  // @ts-ignore
  return handler(event, context);
};

export const handler = handlerNetlify;


