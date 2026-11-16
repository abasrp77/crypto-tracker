<template>
  <div
    class="w-full overflow-hidden border-y border-dark-800/80 bg-dark-950/70 backdrop-blur-md py-2.5 relative select-none"
  >
    <!-- Fade effect on both sides of the ticker -->
    <div
      class="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-950 to-transparent z-10"
    ></div>
    <div
      class="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-950 to-transparent z-10"
    ></div>

    <!-- Skeleton state while initial data is fetching -->
    <div
      v-if="status === 'pending' && !marqueeList.length"
      class="flex gap-8 py-0.5 px-6 animate-pulse"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="h-4 w-28 bg-dark-800 rounded shrink-0"
      ></div>
    </div>

    <!-- Continuous price marquee ticker -->
    <div v-else class="animate-marquee flex items-center gap-8">
      <div
        v-for="(coin, index) in marqueeList"
        :key="`${coin.symbol}-${index}`"
        class="flex items-center gap-2.5 text-xs font-mono shrink-0 cursor-default"
      >
        <span class="font-bold text-white tracking-wide">{{
          coin.symbol
        }}</span>
        <span class="text-slate-400">{{ formatPrice(coin.price) }}</span>
        <span
          class="text-[11px] font-semibold"
          :class="coin.change >= 0 ? 'text-primary' : 'text-rose-400'"
        >
          {{ coin.change >= 0 ? "+" : "" }}{{ coin.change.toFixed(2) }}%
        </span>
        <span class="text-dark-700 select-none ml-3">•</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
}

// Fetch top 50 coins from cached Nuxt server route
const { data: coins, status } = await useFetch<CoinData[]>(
  "/api/coins/markets",
  {
    lazy: true,
    default: () => [],
  },
);

// Duplicate array to create a seamless infinite animation loop
const marqueeList = computed(() => {
  if (!coins.value || coins.value.length === 0) return [];
  return [...coins.value, ...coins.value];
});

// Standard price formatting function with smart decimals
const formatPrice = (val: number) => {
  if (val >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(val);
};
</script>
