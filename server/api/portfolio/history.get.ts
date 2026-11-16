export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId;

  const query = getQuery(event);
  const range = (query.range as string) || "7d";
  const daysCount = range === "90d" ? 90 : range === "30d" ? 30 : 7;

  const portfolio = await prisma.portfolio.findFirst({
    where: { userId },
    select: {
      id: true,
      assets: {
        select: {
          coingeckoId: true,
          amount: true,
          buyPriceUsd: true,
        },
      },
    },
  });

  if (!portfolio) {
    return { success: true, range, history: [] };
  }

  let currentLiveValue = 0;
  if (portfolio.assets.length > 0) {
    const coinIds = Array.from(
      new Set(portfolio.assets.map((a) => a.coingeckoId).filter(Boolean)),
    );

    let priceMap: Record<string, number> = {};
    if (coinIds.length > 0) {
      try {
        const res = await $fetch<Record<string, { usd?: number }>>(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(",")}&vs_currencies=usd`,
          { headers: { Accept: "application/json" } },
        );
        for (const [id, data] of Object.entries(res)) {
          if (data && typeof data.usd === "number") {
            priceMap[id] = data.usd;
          }
        }
      } catch (err) {
        console.error("Failed to fetch live prices for history chart:", err);
      }
    }

    currentLiveValue = portfolio.assets.reduce((sum, item) => {
      const livePrice = priceMap[item.coingeckoId] ?? item.buyPriceUsd;
      return sum + item.amount * livePrice;
    }, 0);
  }

  currentLiveValue = Math.round(currentLiveValue * 100) / 100;

  // 3. Retrieve previously recorded portfolio snapshots
  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { snapshotDate: "asc" },
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]!;

  if (!snapshots.length && portfolio.assets.length === 0) {
    return { success: true, range, history: [] };
  }

  const snapshotMap = new Map<string, number>();
  for (const s of snapshots) {
    snapshotMap.set(s.snapshotDate, s.totalValue);
  }

  // replace today value
  snapshotMap.set(todayStr, currentLiveValue);

  const firstSnapshotDate = snapshots.length
    ? new Date(snapshots[0]!.snapshotDate)
    : now;

  const rangeStartDate = new Date(now);
  rangeStartDate.setDate(now.getDate() - (daysCount - 1));

  const effectiveStartDate =
    firstSnapshotDate > rangeStartDate ? firstSnapshotDate : rangeStartDate;

  const diffTime = now.getTime() - effectiveStartDate.getTime();
  const actualDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const history: Array<{ timestamp: string; label: string; value: number }> =
    [];
  let lastKnownValue = snapshots[0]?.totalValue ?? currentLiveValue;

  for (let i = actualDays - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dateStr = targetDate.toISOString().split("T")[0]!;

    if (snapshotMap.has(dateStr)) {
      lastKnownValue = snapshotMap.get(dateStr)!;
    }

    history.push({
      timestamp: dateStr,
      label: targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: lastKnownValue,
    });
  }

  return {
    success: true,
    range,
    history,
  };
});
