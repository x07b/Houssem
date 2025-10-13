import { RequestHandler } from "express";

// Exchange rates relative to TND (Tunisian Dinar)
// These should ideally be fetched from a live API, but for now we'll use approximate rates
const EXCHANGE_RATES: Record<string, number> = {
  TND: 1,
  USD: 0.32,    // 1 TND ≈ 0.32 USD
  EUR: 0.30,    // 1 TND ≈ 0.30 EUR
  EGP: 16.00,   // 1 TND ≈ 16 EGP
  GBP: 0.26,    // 1 TND ≈ 0.26 GBP
};

/**
 * GET /api/currency/convert?amount=100&from=TND
 * Converts an amount from one currency to all supported currencies
 */
export const convertCurrency: RequestHandler = (req, res) => {
  const { amount, from = "TND" } = req.query;

  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({
      error: "Invalid amount parameter",
    });
  }

  const fromCurrency = String(from).toUpperCase();
  const amountNum = Number(amount);

  if (!EXCHANGE_RATES[fromCurrency]) {
    return res.status(400).json({
      error: `Unsupported currency: ${fromCurrency}`,
    });
  }

  // Convert to TND first (if not already in TND)
  const amountInTND = fromCurrency === "TND" 
    ? amountNum 
    : amountNum / EXCHANGE_RATES[fromCurrency];

  // Convert to all currencies
  const converted: Record<string, number> = {};
  for (const [currency, rate] of Object.entries(EXCHANGE_RATES)) {
    converted[currency] = parseFloat((amountInTND * rate).toFixed(2));
  }

  res.json({
    from: fromCurrency,
    amount: amountNum,
    rates: EXCHANGE_RATES,
    converted,
  });
};

