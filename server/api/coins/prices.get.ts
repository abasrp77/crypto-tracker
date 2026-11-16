export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const symbolsQuery = query.symbols as string;

    if (!symbolsQuery) {
      return { prices: {} };
    }

    // Map symbols to CoinGecko IDs (e.g. BTC,ETH -> bitcoin,ethereum)
    const symbols = symbolsQuery.split(",").map((s) => s.trim().toUpperCase());
    const ids = symbols.map(getCoinGeckoId).join(",");

    try {
      // Call lightweight CoinGecko simple/price endpoint
      const response = await $fetch<
        Record<string, { usd: number; usd_24h_change?: number }>
      >(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids,
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      });

      // Remap live prices by uppercase symbol for convenient frontend consumption
      const prices: Record<
        string,
        { currentPrice: number; change24h: number }
      > = {};

      for (const symbol of symbols) {
        const id = getCoinGeckoId(symbol);
        if (response[id]) {
          prices[symbol] = {
            currentPrice: response[id].usd,
            change24h: response[id].usd_24h_change || 0,
          };
        }
      }

      return {
        success: true,
        prices,
      };
    } catch (error: any) {
      throw createError({
        statusCode: 502,
        statusMessage: "Failed to fetch prices from CoinGecko",
      });
    }
  },
  {
    // Cache response for 45 seconds to stay within free API rate limits
    maxAge: 45,
    name: "coingecko-prices",
    getKey: (event) => {
      const query = getQuery(event);
      return `prices-${query.symbols || "empty"}`;
    },
  },
);
