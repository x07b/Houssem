import { createContext, useContext, useMemo, useState } from "react";

export type Currency = "USD" | "TND" | "EGP" | "EUR";

type Rates = Record<Currency, number>;

const RATES: Rates = {
  USD: 1,
  TND: 3.2,
  EGP: 50,
  EUR: 0.92,
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertFromUSD: (amountUSD: number, to?: Currency) => number;
  format: (amountUSD: number, to?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => (localStorage.getItem("currency") as Currency) || "USD");

  const convertFromUSD = (amountUSD: number, to: Currency = currency) => amountUSD * RATES[to];

  const format = (amountUSD: number, to: Currency = currency) => {
    const value = convertFromUSD(amountUSD, to);
    return new Intl.NumberFormat(undefined, { style: "currency", currency: to }).format(value);
  };

  const value = useMemo(() => ({ currency, setCurrency: (c: Currency) => { localStorage.setItem("currency", c); setCurrency(c); }, convertFromUSD, format }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
