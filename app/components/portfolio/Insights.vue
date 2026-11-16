<template>
  <div
    class="h-full bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md flex flex-col justify-between"
  >
    <!-- Card Header -->
    <div
      class="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80"
    >
      <div>
        <h3 class="text-xs sm:text-sm font-semibold text-white">
          Portfolio Insights
        </h3>
        <p class="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
          Asset health & performance metrics
        </p>
      </div>
      <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
    </div>

    <!-- Top metrics: Stacked on mobile, side-by-side on tablet/desktop -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-3 sm:my-4">
      <div
        class="bg-black/40 border border-zinc-800/60 rounded-xl p-3 sm:p-3.5"
      >
        <div
          class="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-400"
        >
          Top Performer
        </div>
        <div
          v-if="topPerformer && topPerformer.pnlPercent > 0"
          class="mt-2 flex items-center justify-between gap-2"
        >
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate">
              {{ topPerformer.name }}
            </div>
            <div class="text-[10px] text-zinc-400 font-mono">
              {{ topPerformer.symbol }}
            </div>
          </div>
          <div class="text-xs font-mono font-bold text-emerald-400 shrink-0">
            +{{ topPerformer.pnlPercent.toFixed(2) }}%
          </div>
        </div>
        <div v-else class="text-xs text-zinc-500 mt-2">--</div>
      </div>

      <div
        class="bg-black/40 border border-zinc-800/60 rounded-xl p-3 sm:p-3.5"
      >
        <div
          class="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-400"
        >
          Largest Holding
        </div>
        <div
          v-if="dominantAsset"
          class="mt-2 flex items-center justify-between gap-2"
        >
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate">
              {{ dominantAsset.name }}
            </div>
            <div class="text-[10px] text-zinc-400 font-mono truncate">
              {{ formatCryptoPrice(dominantAsset.val) }}
            </div>
          </div>
          <div class="text-xs font-mono font-bold text-zinc-300 shrink-0">
            {{ dominantAsset.share }}%
          </div>
        </div>
        <div v-else class="text-xs text-zinc-500 mt-2">--</div>
      </div>
    </div>

    <!-- Stablecoin Reserve card -->
    <div class="bg-black/40 border border-zinc-800/60 rounded-xl p-3 sm:p-3.5">
      <div class="flex items-center justify-between text-xs">
        <span class="text-zinc-400 text-[10px] sm:text-[11px]"
          >Stablecoin Reserve</span
        >
        <span class="font-mono text-white text-xs font-semibold">
          {{ stableRatio.percentage }}%
        </span>
      </div>

      <div
        class="w-full h-1.5 bg-zinc-800 rounded-full mt-2 sm:mt-2.5 overflow-hidden"
      >
        <div
          class="h-full bg-blue-500 transition-all duration-500 rounded-full"
          :style="{ width: `${stableRatio.percentage}%` }"
        ></div>
      </div>

      <div
        class="flex items-center justify-between text-[10px] text-zinc-400 mt-2 font-mono"
      >
        <span>{{ formatCryptoPrice(stableRatio.total) }} Liquid</span>
        <span
          >{{ (100 - Number(stableRatio.percentage)).toFixed(1) }}%
          Volatile</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Asset {
  symbol: string;
  name: string;
  totalAmount: number;
  weightedAvgBuyPrice: number;
  currentPrice?: number;
}

const props = defineProps<{
  holdings: Asset[];
}>();

const stableSymbols = [
  "USDT",
  "USDC",
  "DAI",
  "USDS",
  "FDUSD",
  "PYUSD",
  "TUSD",
  "USDD",
  "USDE",
  "RLUSD",
  "CRVUSD",
  "USDG",
  "USD0",
  "OUSD",
  "AUSD",
];

const topPerformer = computed(() => {
  if (!props.holdings?.length) return null;

  const volatileAssets = props.holdings.filter(
    (asset) => !stableSymbols.includes((asset.symbol || "").toUpperCase()),
  );

  if (!volatileAssets.length) return null;

  const calculated = volatileAssets.map((asset) => {
    const buy = Number(asset.weightedAvgBuyPrice || 0);
    const current = Number(asset.currentPrice || buy);
    const pnlPercent = buy > 0 ? ((current - buy) / buy) * 100 : 0;
    return { ...asset, pnlPercent };
  });

  calculated.sort((a, b) => b.pnlPercent - a.pnlPercent);
  return calculated[0];
});

const stableRatio = computed(() => {
  if (!props.holdings.length) return { percentage: "0.0", total: 0 };

  let totalVal = 0;
  let stableVal = 0;

  props.holdings.forEach((a) => {
    const price = Number(a.currentPrice || a.weightedAvgBuyPrice || 0);
    const val = Number(a.totalAmount || 0) * price;
    totalVal += val;
    if (stableSymbols.includes(a.symbol.toUpperCase())) {
      stableVal += val;
    }
  });

  const percentage = totalVal > 0 ? (stableVal / totalVal) * 100 : 0;
  return {
    percentage: percentage.toFixed(1),
    total: stableVal,
  };
});

const dominantAsset = computed(() => {
  if (!props.holdings.length) return null;

  let totalVal = 0;
  const grouped: Record<string, { symbol: string; name: string; val: number }> =
    {};

  props.holdings.forEach((a) => {
    const price = Number(a.currentPrice || a.weightedAvgBuyPrice || 0);
    const val = Number(a.totalAmount || 0) * price;
    totalVal += val;

    grouped[a.symbol] = { symbol: a.symbol, name: a.name, val };
  });

  const sorted = Object.values(grouped).sort((a, b) => b.val - a.val);
  const top = sorted[0];
  if (!top || totalVal === 0) return null;

  return {
    ...top,
    share: ((top.val / totalVal) * 100).toFixed(1),
  };
});
</script>
