import { getLivePrices } from "~~/server/utils/cryptoPrice";

export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId;

  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 5);
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const whereCondition: any = {
    portfolio: { userId },
    deletedAt: null,
    ...(search && {
      OR: [{ symbol: { contains: search } }, { name: { contains: search } }],
    }),
  };

  const [paginatedAssets, totalRecords, allUserAssets] = await Promise.all([
    prisma.cryptoAsset.findMany({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.cryptoAsset.count({ where: whereCondition }),
    prisma.cryptoAsset.findMany({
      where: { portfolio: { userId } },
      select: {
        symbol: true,
        name: true,
        image: true,
        amount: true,
        buyPriceUsd: true,
      },
    }),
  ]);

  const uniqueSymbols = Array.from(new Set(allUserAssets.map((a) => a.symbol)));
  const livePrices = await getLivePrices(uniqueSymbols);

  const groupedAnalytics: Record<
    string,
    {
      symbol: string;
      name: string;
      image?: string | null;
      totalAmount: number;
      weightedAvgBuyPrice: number;
      currentPrice: number;
      change24h: number;
      totalValue: number;
      totalCost: number;
      pnl: number;
      pnlPercent: number;
    }
  > = {};

  let portfolioTotalCost = 0;
  let portfolioCurrentValue = 0;

  for (const asset of allUserAssets) {
    const sym = asset.symbol;
    const amount = Number(asset.amount || 0);
    const buyPrice = Number(asset.buyPriceUsd || 0);
    const live = livePrices[sym] || { currentPrice: buyPrice, change24h: 0 };

    if (!groupedAnalytics[sym]) {
      groupedAnalytics[sym] = {
        symbol: sym,
        name: asset.name,
        image: asset.image,
        totalAmount: amount,
        weightedAvgBuyPrice: buyPrice,
        currentPrice: live.currentPrice,
        change24h: live.change24h,
        totalValue: amount * live.currentPrice,
        totalCost: amount * buyPrice,
        pnl: 0,
        pnlPercent: 0,
      };
    } else {
      const prev = groupedAnalytics[sym];
      const prevCost = prev.totalCost;
      const newCost = amount * buyPrice;
      const combinedAmount = prev.totalAmount + amount;

      prev.totalAmount = combinedAmount;
      prev.totalCost = prevCost + newCost;
      prev.weightedAvgBuyPrice =
        combinedAmount > 0 ? prev.totalCost / combinedAmount : 0;
      prev.totalValue = combinedAmount * live.currentPrice;
    }
  }

  const analyticsList = Object.values(groupedAnalytics)
    .map((item) => {
      item.pnl = item.totalValue - item.totalCost;
      item.pnlPercent =
        item.totalCost > 0 ? (item.pnl / item.totalCost) * 100 : 0;

      portfolioTotalCost += item.totalCost;
      portfolioCurrentValue += item.totalValue;

      return item;
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  const totalPnl = portfolioCurrentValue - portfolioTotalCost;
  const pnlPercentage =
    portfolioTotalCost > 0 ? (totalPnl / portfolioTotalCost) * 100 : 0;

  const tableWithPrices = paginatedAssets.map((asset) => {
    const live = livePrices[asset.symbol] || {
      currentPrice: asset.buyPriceUsd,
      change24h: 0,
    };
    return {
      ...asset,
      currentPrice: live.currentPrice,
      change24h: live.change24h,
    };
  });

  return {
    summary: {
      totalInvested: portfolioTotalCost,
      currentValue: portfolioCurrentValue,
      totalPnl,
      pnlPercentage,
    },
    table: {
      data: tableWithPrices,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    },
    analytics: analyticsList,
  };
});
