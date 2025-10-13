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
  const initial = (() => {
    try {
      const v = typeof window !== 'undefined' ? (localStorage.getItem("currency") as Currency | null) : null;
      return (v === 'USD' || v === 'TND' || v === 'EGP' || v === 'EUR') ? v : 'USD';
    } catch {
      return 'USD';
    }
  })();

  const [currency, setCurrency] = useState<Currency>(initial);

  const safeCurrency = (c?: Currency): Currency => (c === 'USD' || c === 'TND' || c === 'EGP' || c === 'EUR') ? c : 'USD';

  const convertFromUSD = (amountUSD: number, to?: Currency) => {
    const cur = safeCurrency(to ?? currency);
    const rate = RATES[cur] ?? 1;
    return (Number.isFinite(amountUSD) ? amountUSD : 0) * rate;
  };

  const format = (amountUSD: number, to?: Currency) => {
    const cur = safeCurrency(to ?? currency);
    const value = convertFromUSD(amountUSD, cur);
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(value);
    } catch {
      return `$${(value || 0).toFixed(2)}`;
    }
  };

  const value = useMemo(
    () => ({
      currency,
      setCurrency: (c: Currency) => {
        const next = safeCurrency(c);
        try { if (typeof window !== 'undefined') localStorage.setItem("currency", next); } catch {}
        setCurrency(next);
      },
      convertFromUSD,
      format,
    }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
