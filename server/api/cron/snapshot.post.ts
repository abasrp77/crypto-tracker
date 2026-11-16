export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const authHeader = getHeader(event, "authorization");
  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const portfolios = await prisma.portfolio.findMany({
    select: {
      id: true,
      assets: {
        select: {
          coingeckoId: true,
          amount: true,
        },
      },
    },
  });

  if (!portfolios.length) {
    return {
      success: true,
      message: "No portfolios found.",
      snapshotsCreated: 0,
    };
  }

  const uniqueCoinIds = Array.from(
    new Set(
      portfolios
        .flatMap((p) => p.assets)
        .map((a) => a.coingeckoId)
        .filter(Boolean),
    ),
  );

  const priceMap: Record<string, number> = {};

  if (uniqueCoinIds.length > 0) {
    try {
      const idsParam = uniqueCoinIds.join(",");
      const res = await $fetch<Record<string, { usd?: number }>>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`,
        { headers: { Accept: "application/json" } },
      );

      for (const [id, data] of Object.entries(res)) {
        if (data && typeof data.usd === "number") {
          priceMap[id] = data.usd;
        }
      }
    } catch (err) {
      console.error("CoinGecko API price fetch error in cron:", err);
      throw createError({
        statusCode: 502,
        statusMessage: "Failed to fetch live prices from CoinGecko",
      });
    }
  }

  const todayStr = new Date().toISOString().split("T")[0]!;

  // 4. Compute and persist snapshot for each portfolio (recording 0 for empty portfolios)
  const upsertPromises = portfolios.map((portfolio) => {
    let totalVal = 0;

    for (const asset of portfolio.assets) {
      const price = priceMap[asset.coingeckoId] ?? 0;
      totalVal += asset.amount * price;
    }

    const roundedTotal = Math.round(totalVal * 100) / 100;

    return prisma.portfolioSnapshot.upsert({
      where: {
        portfolioId_snapshotDate: {
          portfolioId: portfolio.id,
          snapshotDate: todayStr,
        },
      },
      update: { totalValue: roundedTotal },
      create: {
        portfolioId: portfolio.id,
        snapshotDate: todayStr,
        totalValue: roundedTotal,
      },
    });
  });

  await Promise.all(upsertPromises);

  // 5. Clean up historical snapshots older than 90 days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoffDateStr = cutoffDate.toISOString().split("T")[0]!;

  await prisma.portfolioSnapshot.deleteMany({
    where: {
      snapshotDate: { lt: cutoffDateStr },
    },
  });

  return {
    success: true,
    message: `Recorded daily snapshots for ${portfolios.length} portfolios.`,
    date: todayStr,
    snapshotsCreated: portfolios.length,
  };
});
