import { getLivePrices } from "~~/server/utils/cryptoPrice";

export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Fetch active (non-deleted) assets for current user
  const assets = await prisma.cryptoAsset.findMany({
    where: {
      portfolio: { userId },
      deletedAt: null,
    },
    select: {
      symbol: true,
      amount: true,
      buyPriceUsd: true,
    },
  });

  if (!assets || assets.length === 0) {
    return {
      success: true,
      activeAssetCount: 0,
      totalInitialInvestment: 0,
      totalCurrentValue: 0,
      totalPnL: 0,
      pnlPercentage: 0,
    };
  }

  const uniqueSymbols = Array.from(new Set(assets.map((a) => a.symbol)));
  const livePrices = await getLivePrices(uniqueSymbols);

  let totalInitialInvestment = 0;
  let totalCurrentValue = 0;

  for (const asset of assets) {
    const amount = Number(asset.amount || 0);
    const buyPrice = Number(asset.buyPriceUsd || 0);

    totalInitialInvestment += amount * buyPrice;

    const live =
      livePrices[asset.symbol] || {
        currentPrice: buyPrice,
        change24h: 0,
      };
    totalCurrentValue += amount * live.currentPrice;
  }

  const totalPnL = totalCurrentValue - totalInitialInvestment;
  const pnlPercentage =
    totalInitialInvestment > 0 ? (totalPnL / totalInitialInvestment) * 100 : 0;

  return {
    success: true,
    activeAssetCount: assets.length,
    totalInitialInvestment: Math.round(totalInitialInvestment * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalPnL: Math.round(totalPnL * 100) / 100,
    pnlPercentage: Math.round(pnlPercentage * 100) / 100,
  };
});
