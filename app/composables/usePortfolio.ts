// composables/usePortfolio.ts
export interface CryptoAsset {
  id: number;
  symbol: string;
  name: string;
  image?: string;
  amount: number;
  buyPriceUsd: number;
  currentPrice: number;
  change24h: number;
  createdAt: string;
}

export interface AnalyticsAsset {
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

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalRecords: number;
  totalPages: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  pnlPercentage: number;
}

export interface PortfolioResponse {
  summary: PortfolioSummary;
  table: {
    data: CryptoAsset[];
    pagination: PaginationMeta;
  };
  analytics: AnalyticsAsset[];
}

export const usePortfolio = () => {
  const tableAssets = useState<CryptoAsset[]>(
    "portfolio_table_assets",
    () => [],
  );
  const analyticsAssets = useState<AnalyticsAsset[]>(
    "portfolio_analytics_assets",
    () => [],
  );
  const summary = useState<PortfolioSummary>("portfolio_summary", () => ({
    totalInvested: 0,
    currentValue: 0,
    totalPnl: 0,
    pnlPercentage: 0,
  }));
  const pagination = useState<PaginationMeta>("portfolio_pagination", () => ({
    currentPage: 1,
    perPage: 5,
    totalRecords: 0,
    totalPages: 1,
  }));

  const { apiFetch } = useApi();
  const toast = useToast();

  const isLoading = ref(false);
  const isRefreshing = ref(false);

  // Table query and pagination parameters
  const page = ref(1);
  const limit = ref(5);
  const search = ref("");
  const sortBy = ref("createdAt");
  const sortOrder = ref<"asc" | "desc">("desc");

  let abortController: AbortController | null = null;
  let refreshInterval: NodeJS.Timeout | null = null;

  const fetchPortfolio = async (silent = false) => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    if (silent) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }

    try {
      const data = await apiFetch<PortfolioResponse>("/portfolio", {
        signal: abortController.signal,
        query: {
          page: page.value,
          limit: limit.value,
          search: search.value,
          sortBy: sortBy.value,
          sortOrder: sortOrder.value,
        },
      });

      summary.value = data.summary;
      tableAssets.value = data.table.data;
      pagination.value = data.table.pagination;
      analyticsAssets.value = data.analytics;
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        return;
      }
      console.error("Failed to fetch portfolio:", err);
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  };

  const startAutoRefresh = (intervalMs = 60000) => {
    stopAutoRefresh();
    refreshInterval = setInterval(() => {
      fetchPortfolio(true);
    }, intervalMs);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  const removeAsset = async (asset: { id: number; symbol: string }) => {
    try {
      await apiFetch(`/portfolio/asset/${asset.id}`, { method: "DELETE" });
      fetchPortfolio();
      toast.success(
        `${asset.symbol} holding has been removed from your portfolio.`,
      );
    } catch {}
  };

  const resetPortfolio = () => {
    tableAssets.value = [];
    analyticsAssets.value = [];
    summary.value = {
      totalInvested: 0,
      currentValue: 0,
      totalPnl: 0,
      pnlPercentage: 0,
    };
    page.value = 1;
    search.value = "";
    stopAutoRefresh();
  };

  return {
    tableAssets,
    analyticsAssets,
    summary,
    pagination,
    isLoading,
    isRefreshing,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    fetchPortfolio,
    startAutoRefresh,
    stopAutoRefresh,
    removeAsset,
    resetPortfolio,
  };
};
