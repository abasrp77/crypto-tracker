<!-- components/portfolio/PerformanceChart.vue -->
<template>
  <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
    <!-- Chart Header and Timeframe Selectors -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div>
        <h3 class="text-sm font-semibold text-white">Portfolio Performance</h3>
        <p class="text-xs text-zinc-400 mt-0.5">
          Historical Portfolio Value (based on market price, not buy price)
        </p>
      </div>

      <div
        class="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800"
      >
        <button
          v-for="r in ['7d', '30d', '90d']"
          :key="r"
          type="button"
          @click="changeRange(r)"
          class="px-3 py-1 text-xs font-medium rounded-lg transition-all"
          :class="
            selectedRange === r
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          "
        >
          {{ r.toUpperCase() }}
        </button>
      </div>
    </div>

    <!-- Chart Canvas Body -->
    <div class="h-64 w-full relative flex items-center justify-center">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm z-10"
      >
        <div
          class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>

      <!-- Fallback when recorded history is less than 2 days -->
      <div
        v-if="!isLoading && rawHistory.length < 2"
        class="flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-zinc-800/80 rounded-xl w-full h-full bg-black/20"
      >
        <div
          class="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <p class="text-xs font-medium text-zinc-300">
          Collecting valuation history...
        </p>
        <p class="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
          Historical trends appear once daily portfolio snapshots accumulate
          over time.
        </p>
      </div>

      <!-- Render chart when at least 2 data points are available -->
      <Line
        v-else-if="chartData.labels.length"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const selectedRange = ref("7d");
const isLoading = ref(false);
const rawHistory = ref<Array<{ label: string; value: number }>>([]);

const { apiFetch } = useApi();
const fetchHistory = async () => {
  isLoading.value = true;
  try {
    const res = await apiFetch<{
      success: boolean;
      history: Array<{ label: string; value: number }>;
    }>(`/api/portfolio/history?range=${selectedRange.value}`);
    rawHistory.value = res.history;
  } catch (err) {
    console.error("Failed to load chart data:", err);
  } finally {
    isLoading.value = false;
  }
};

const changeRange = (r: string) => {
  if (selectedRange.value === r) return;
  selectedRange.value = r;
  fetchHistory();
};

const chartData = computed(() => {
  const isPositive =
    rawHistory.value.length >= 2
      ? rawHistory.value[rawHistory.value.length - 1]!.value >=
        rawHistory.value[0]!.value
      : true;

  const color = isPositive ? "rgba(16, 185, 129, 1)" : "rgba(244, 63, 94, 1)";
  const gradientColor = isPositive
    ? "rgba(16, 185, 129, 0.15)"
    : "rgba(244, 63, 94, 0.15)";

  return {
    labels: rawHistory.value.map((p) => p.label),
    datasets: [
      {
        data: rawHistory.value.map((p) => p.value),
        borderColor: color,
        borderWidth: 2,
        backgroundColor: gradientColor,
        fill: true,
        tension: 0.35,
        // Display data point dots if number of points is small
        pointRadius: rawHistory.value.length <= 4 ? 3 : 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#18181b",
      titleColor: "#a1a1aa",
      bodyColor: "#ffffff",
      borderColor: "#27272a",
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        label: (context: any) =>
          ` $${Number(context.raw).toLocaleString("en-US")}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#71717a", font: { size: 10 } },
    },
    y: {
      position: "right" as const,
      grid: { color: "rgba(39, 39, 42, 0.4)" },
      ticks: {
        color: "#71717a",
        font: { size: 10 },
        maxTicksLimit: 6, // Prevent grid line overcrowding
        callback: function (val: any) {
          const num = Number(val);
          if (num >= 1_000_000) {
            return `$${(num / 1_000_000).toFixed(2)}M`;
          }
          if (num >= 10_000) {
            // Use 1 decimal place for values over 10k to prevent duplicate tick labels (e.g., 39.2k vs 39.8k)
            return `$${(num / 1000).toFixed(1)}k`;
          }
          if (num >= 1_000) {
            return `$${(num / 1000).toFixed(2)}k`;
          }
          return `$${num.toLocaleString("en-US")}`;
        },
      },
    },
  },
};

onMounted(() => {
  fetchHistory();
});

defineExpose({
  refresh: fetchHistory,
});
</script>
