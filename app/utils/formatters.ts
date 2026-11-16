// utils/formatters.ts

/**
 * Smart price and USD currency formatting utility
 */
export function formatCryptoPrice(
  val: number | string | null | undefined,
): string {
  const num = Number(val ?? 0);

  if (isNaN(num) || num === 0) {
    return "$0.00";
  }

  const abs = Math.abs(num);

  // 1. Large cap or stablecoins (price >= $1), e.g. BTC, ETH, USDT
  if (abs >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  // 2. Sub-dollar assets ($0.01 - $1.00), e.g. DOGE, ADA, XRP
  if (abs >= 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(num);
  }

  // 3. Micro-cap / meme coins (< $0.01), e.g. PEPE, SHIB, BONK
  // Displays up to 8 decimal places while trimming trailing zeros
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  }).format(num);
}

/**
 * Format holding quantity (Amount) based on asset precision
 */
export function formatCryptoAmount(
  amount: number | string | null | undefined,
): string {
  const num = Number(amount ?? 0);
  if (isNaN(num) || num === 0) return "0";

  // Large quantities (e.g. 1,000,000 DOGE) do not require decimal places
  if (num >= 1000) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(num);
  }

  // Fractional amounts (e.g. 0.005 BTC)
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(num);
}
