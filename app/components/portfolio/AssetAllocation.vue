<template>
  <div
    class="h-full bg-zinc-900/40 border border-zinc-800 rounded-2xl py-4 sm:py-6 backdrop-blur-md flex flex-col justify-between"
  >
    <!-- Card Header -->
    <div
      class="px-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-200 mb-4 sm:mb-6"
    >
      Asset Allocation
    </div>

    <div
      class="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8"
    >
      <!-- SVG Donut Chart (full dimensions without extra padding) -->
      <div
        class="relative w-40 h-40 sm:w-44 sm:h-44 shrink-0 mx-auto sm:mx-0 sm:ml-6"
      >
        <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            class="stroke-zinc-800"
            stroke-width="3.5"
          />
          <circle
            v-for="item in allocationData"
            :key="item.symbol"
            cx="18"
            cy="18"
            r="14"
            fill="none"
            :stroke="item.color"
            stroke-width="3.5"
            :stroke-dasharray="item.strokeDasharray"
            :stroke-dashoffset="item.strokeDashoffset"
            stroke-linecap="round"
            class="transition-all duration-700 ease-out"
            pathLength="100"
          />
        </svg>

        <div
          class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <span
            class="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase"
          >
            Assets
          </span>
          <span class="text-lg sm:text-xl font-bold font-mono text-white">
            {{ holdings.length }}
          </span>
        </div>
      </div>

      <!-- Asset allocation breakdown list -->
      <div
        class="flex-1 w-full space-y-2.5 sm:space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar px-4 sm:px-6"
      >
        <div
          v-for="item in allocationData"
          :key="item.symbol"
          class="flex items-center justify-between text-xs py-1 border-b border-zinc-800/40 last:border-0"
        >
          <!-- Left column: Color, name, and asset amount -->
          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: item.color }"
            ></span>
            <div class="min-w-0">
              <div
                class="text-zinc-200 font-semibold truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none"
              >
                {{ item.name }}
              </div>
              <div
                class="text-[10px] sm:text-[11px] font-mono text-zinc-400 mt-0.5 truncate"
              >
                {{ formatCryptoAmount(item.totalAmount) }} {{ item.symbol }}
              </div>
            </div>
          </div>

          <!-- Right column: USD valuation and allocation percentage -->
          <div class="text-right shrink-0">
            <div class="font-mono font-bold text-zinc-100 text-xs sm:text-sm">
              {{ formatCryptoPrice(item.value) }}
            </div>
            <div class="font-mono text-[10px] sm:text-[11px] text-zinc-400">
              {{ item.percent }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HoldingItem {
  symbol: string;
  name: string;
  totalAmount: number;
  currentPrice: number;
  [key: string]: any;
}

const props = defineProps<{
  holdings: HoldingItem[];
}>();

const palette = [
  "#F7931A", // BTC
  "#627EEA", // ETH
  "#26A17B", // USDT
  "#9945FF", // SOL
  "#E84142", // AVAX
  "#3B82F6", // Blue default
  "#10B981", // Emerald default
];

const allocationData = computed(() => {
  const items = props.holdings.map((h, i) => ({
    symbol: h.symbol,
    name: h.name,
    totalAmount: h.totalAmount,
    value: h.totalAmount * h.currentPrice,
    color: palette[i % palette.length],
  }));

  const total = items.reduce((acc, curr) => acc + curr.value, 0);
  if (total === 0) return [];

  let accumulatedPercent = 0;

  return items.map((item) => {
    const percent = (item.value / total) * 100;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -accumulatedPercent;
    accumulatedPercent += percent;

    return {
      ...item,
      percent: percent.toFixed(1),
      strokeDasharray,
      strokeDashoffset,
    };
  });
});
</script>
