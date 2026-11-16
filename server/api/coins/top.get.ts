// server/api/coins/top.get.ts
interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

export default defineCachedEventHandler(
  async () => {
    try {
      const data = await $fetch<MarketCoin[]>(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 200,
            page: 1,
            sparkline: false,
          },
        },
      );

      return data.map((c) => ({
        id: c.id,
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        image: c.image,
        currentPrice: c.current_price,
      }));
    } catch {
      return [];
    }
  },
  {
    // Server-side cache for 1 hour
    maxAge: 60 * 60,
    name: "coingecko-top-100",
  },
);
