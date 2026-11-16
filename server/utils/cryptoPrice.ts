export interface PriceData {
  currentPrice: number;
  change24h: number;
}

const priceCache = new Map<string, { data: PriceData; expiresAt: number }>();
const CACHE_TTL = 60 * 1000;

export async function getLivePrices(
  symbols: string[],
): Promise<Record<string, PriceData>> {
  if (!symbols.length) return {};

  const now = Date.now();
  const missingSymbols: string[] = [];
  const result: Record<string, PriceData> = {};

  // 1. Check in-memory price cache
  for (const sym of symbols) {
    const upperSym = sym.toUpperCase();
    const cached = priceCache.get(upperSym);
    if (cached && cached.expiresAt > now) {
      result[upperSym] = cached.data;
    } else {
      missingSymbols.push(upperSym);
    }
  }

  if (missingSymbols.length > 0) {
    try {
      const ids = missingSymbols
        .map((s) => getCoinGeckoId(s))
        .filter(Boolean)
        .join(",");

      if (ids) {
        const response = await $fetch<
          Record<string, { usd: number; usd_24h_change?: number }>
        >(`https://api.coingecko.com/api/v3/simple/price`, {
          params: {
            ids,
            vs_currencies: "usd",
            include_24hr_change: true,
          },
        });

        for (const sym of missingSymbols) {
          const id = getCoinGeckoId(sym);
          if (response && response[id]) {
            const priceInfo: PriceData = {
              currentPrice: response[id].usd,
              change24h: response[id].usd_24h_change ?? 0,
            };
            result[sym] = priceInfo;
            priceCache.set(sym, {
              data: priceInfo,
              expiresAt: now + CACHE_TTL,
            });
          }
        }
      }
    } catch (e) {
      console.error("CoinGecko Fetch Error in getLivePrices:", e);
    }
  }

  return result;
}
