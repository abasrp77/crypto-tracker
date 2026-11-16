// server/api/coins/markets.get.ts
export default cachedEventHandler(
  async () => {
    try {
      const data = await $fetch<any[]>(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 50,
            page: 1,
            sparkline: false,
            price_change_percentage: "24h",
          },
          headers: {
            // Optional: Attach free or demo CoinGecko API key if available
            // 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || ''
          },
        },
      );

      return data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_percentage_24h ?? 0,
      }));
    } catch (error) {
      console.error("CoinGecko API Fetch Error:", error);
      return [];
    }
  },
  {
    maxAge: 60, // Server cache for 60 seconds
    name: "coingecko-top-50",
  },
);
