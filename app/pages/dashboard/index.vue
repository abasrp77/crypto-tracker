<!-- index.vue -->
<template>
  <div
    class="bg-black text-zinc-100 p-3.5 sm:p-6 md:p-8 lg:p-10 font-sans min-h-screen"
  >
    <div class="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <!-- Dashboard Header -->
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Portfolio Overview
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-0.5 sm:mt-1">
            Real-time performance and valuation of your holdings
          </p>
        </div>
        <button
          @click="openAddModal"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Asset
        </button>
      </div>

      <!-- Top Summary Stat Cards -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        <div
          class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5"
        >
          <span
            class="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider"
          >
            Total Value
          </span>
          <div class="text-xl sm:text-2xl font-bold text-white mt-1.5 sm:mt-2">
            {{ formatCryptoPrice(summary.currentValue) }}
          </div>
        </div>

        <div
          class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5"
        >
          <span
            class="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider"
          >
            Total Invested
          </span>
          <div
            class="text-xl sm:text-2xl font-bold text-zinc-200 mt-1.5 sm:mt-2"
          >
            {{ formatCryptoPrice(summary.totalInvested) }}
          </div>
        </div>

        <div
          class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 sm:col-span-2 lg:col-span-1"
        >
          <span
            class="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider"
          >
            All-Time P&L
          </span>
          <div
            class="text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2"
            :class="
              summary.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            "
          >
            <span>
              {{ summary.totalPnl >= 0 ? "+" : "" }}
              {{ formatCryptoPrice(summary.totalPnl) }}
            </span>
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="
                summary.totalPnl >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
              "
            >
              {{ summary.pnlPercentage.toFixed(2) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Collapsible Analytics & Donut Allocation Section -->
      <div
        v-if="analyticsAssets.length"
        class="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all duration-300"
      >
        <div
          @click="showAnalytics = !showAnalytics"
          class="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-zinc-800/30 gap-2"
          :class="{ 'border-b border-zinc-800/80': showAnalytics }"
        >
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
            <div class="min-w-0">
              <h2
                class="text-xs sm:text-sm font-semibold text-white tracking-wide truncate"
              >
                Portfolio Analytics & Performance
              </h2>
              <p
                class="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate"
              >
                Allocation breakdown & risk insights
              </p>
            </div>
          </div>

          <button
            type="button"
            class="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs text-zinc-400 hover:text-white bg-black/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-lg transition-colors"
          >
            <span class="hidden xs:inline">{{
              showAnalytics ? "Collapse" : "Expand"
            }}</span>
            <svg
              class="w-3.5 h-3.5 transition-transform duration-300"
              :class="{ '-rotate-180': !showAnalytics }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <UiCollapse>
          <div v-if="showAnalytics" class="p-3 sm:p-5 space-y-4">
            <PortfolioPerformanceChart ref="chartRef" />
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <PortfolioAssetAllocation :holdings="analyticsAssets" />
              </div>
              <div>
                <PortfolioInsights :holdings="analyticsAssets" />
              </div>
            </div>
          </div>
        </UiCollapse>
      </div>

      <!-- Holdings Table -->
      <div
        class="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-sm"
      >
        <!-- Search & Filter Controls Toolbar -->
        <div
          class="p-3.5 sm:px-6 sm:py-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3"
        >
          <div
            class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <h2 class="text-sm sm:text-base font-semibold text-white">
              Your Holdings
            </h2>
            <div class="relative w-full sm:w-60">
              <input
                v-model="searchInput"
                placeholder="Search symbol or name..."
                class="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div
            class="flex items-center gap-2 justify-between sm:justify-end flex-wrap sm:flex-nowrap"
          >
            <select
              v-model="sortBy"
              @change="fetchPortfolio(false)"
              class="flex-1 sm:flex-initial bg-black/50 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none [color-scheme:dark]"
            >
              <option class="bg-zinc-900 text-zinc-300" value="createdAt">
                Date Added
              </option>
              <option class="bg-zinc-900 text-zinc-300" value="buyPriceUsd">
                Buy Price
              </option>
              <option class="bg-zinc-900 text-zinc-300" value="amount">
                Holdings Amount
              </option>
            </select>

            <button
              @click="toggleSortOrder"
              class="w-8 h-8 flex justify-center items-center shrink-0 rounded-lg border border-zinc-800 bg-black/50 text-zinc-400 hover:text-white"
              :title="sortOrder === 'asc' ? 'Ascending' : 'Descending'"
            >
              <span class="text-xs font-mono font-bold">{{
                sortOrder === "asc" ? "▲" : "▼"
              }}</span>
            </button>

            <button
              @click="fetchPortfolio(false)"
              :disabled="isLoading || isRefreshing"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-black/50 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50 shrink-0"
            >
              <svg
                class="w-3.5 h-3.5 transition-transform"
                :class="{
                  'animate-spin text-blue-400': isLoading || isRefreshing,
                }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span class="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>

        <!-- Table with smooth horizontal overflow on mobile -->
        <div class="overflow-x-auto scrollbar-thin">
          <table
            class="w-full text-left text-sm text-zinc-300 min-w-[620px] sm:min-w-full"
          >
            <thead
              class="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800"
            >
              <tr>
                <th class="px-4 sm:px-6 py-3.5">Asset</th>
                <th class="px-4 sm:px-6 py-3.5">Holdings</th>
                <th class="px-4 sm:px-6 py-3.5">Buy Price</th>
                <th class="px-4 sm:px-6 py-3.5">Current Price</th>
                <th class="px-4 sm:px-6 py-3.5">P&L</th>
                <th class="px-4 sm:px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-zinc-800/60 text-xs sm:text-sm">
              <template v-if="isLoading">
                <tr
                  v-for="i in limit"
                  :key="'skeleton-' + i"
                  class="animate-pulse"
                >
                  <td class="px-4 sm:px-6 py-3.5 flex items-center gap-3">
                    <div
                      class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 shrink-0"
                    ></div>
                    <div class="space-y-1.5">
                      <div class="h-3.5 w-16 sm:w-20 bg-zinc-800 rounded"></div>
                      <div class="h-2.5 w-10 bg-zinc-800/60 rounded"></div>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-3.5">
                    <div class="space-y-1.5">
                      <div class="h-3.5 w-20 sm:w-24 bg-zinc-800 rounded"></div>
                      <div class="h-2.5 w-14 bg-zinc-800/60 rounded"></div>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-3.5">
                    <div class="h-3.5 w-14 sm:w-16 bg-zinc-800 rounded"></div>
                  </td>
                  <td class="px-4 sm:px-6 py-3.5">
                    <div class="space-y-1.5">
                      <div class="h-3.5 w-16 sm:w-20 bg-zinc-800 rounded"></div>
                      <div class="h-2.5 w-10 bg-zinc-800/60 rounded"></div>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-3.5">
                    <div class="space-y-1.5">
                      <div class="h-3.5 w-14 sm:w-16 bg-zinc-800 rounded"></div>
                      <div class="h-2.5 w-10 bg-zinc-800/60 rounded"></div>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-3.5 text-right">
                    <div class="h-3 w-8 bg-zinc-800 rounded ml-auto"></div>
                  </td>
                </tr>
              </template>

              <template v-else>
                <tr
                  v-for="asset in tableAssets"
                  :key="asset.id"
                  class="hover:bg-zinc-800/30 transition-colors"
                >
                  <!-- Asset Column -->
                  <td
                    class="px-4 sm:px-6 py-3.5 flex items-center gap-2.5 sm:gap-3"
                  >
                    <div
                      class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-zinc-800 overflow-hidden shrink-0"
                    >
                      <NuxtImg
                        v-if="asset.image"
                        :src="asset.image"
                        :alt="asset.name"
                        width="32"
                        height="32"
                        class="rounded-full w-full h-full object-cover"
                      />
                      <span v-else class="text-[11px] font-bold">{{
                        asset.symbol[0]
                      }}</span>
                    </div>
                    <div class="min-w-0">
                      <div
                        class="font-medium text-white truncate max-w-[100px] sm:max-w-none"
                      >
                        {{ asset.name }}
                      </div>
                      <div class="text-[11px] text-zinc-500">
                        {{ asset.symbol }}
                      </div>
                    </div>
                  </td>

                  <!-- Holdings Column -->
                  <td class="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    <div>
                      {{ formatCryptoAmount(asset.amount) }} {{ asset.symbol }}
                    </div>
                    <div class="text-[11px] text-zinc-500">
                      {{ formatCryptoPrice(asset.amount * asset.currentPrice) }}
                    </div>
                  </td>

                  <!-- Buy Price Column -->
                  <td class="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    {{ formatCryptoPrice(asset.buyPriceUsd) }}
                  </td>

                  <!-- Current Price Column -->
                  <td class="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    <div class="font-medium text-white">
                      {{ formatCryptoPrice(asset.currentPrice) }}
                    </div>
                    <div
                      v-if="asset.change24h !== undefined"
                      class="text-[11px]"
                      :class="
                        asset.change24h >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      "
                    >
                      {{ asset.change24h >= 0 ? "+" : ""
                      }}{{ asset.change24h.toFixed(2) }}%
                    </div>
                  </td>

                  <!-- P&L Column -->
                  <td class="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    <div
                      class="font-medium"
                      :class="
                        asset.currentPrice - asset.buyPriceUsd >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      "
                    >
                      {{ asset.currentPrice - asset.buyPriceUsd >= 0 ? "+" : ""
                      }}{{
                        formatCryptoPrice(
                          (asset.currentPrice - asset.buyPriceUsd) *
                            asset.amount,
                        )
                      }}
                    </div>
                    <div class="text-[11px] text-zinc-500">
                      {{ asset.currentPrice - asset.buyPriceUsd >= 0 ? "+" : ""
                      }}{{
                        (
                          ((asset.currentPrice - asset.buyPriceUsd) /
                            asset.buyPriceUsd) *
                          100
                        ).toFixed(2)
                      }}%
                    </div>
                  </td>

                  <!-- Actions Column -->
                  <td class="px-4 sm:px-6 py-3.5 text-right whitespace-nowrap">
                    <div class="flex justify-end gap-2.5">
                      <button
                        @click="openEditModal(asset)"
                        class="text-zinc-400 hover:text-blue-400 text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        @click="openDeleteModal(asset)"
                        class="text-zinc-400 hover:text-rose-400 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!tableAssets.length">
                  <td colspan="6" class="py-12 sm:py-16 px-4">
                    <div
                      class="flex flex-col items-center justify-center text-center max-w-sm mx-auto"
                    >
                      <template v-if="search">
                        <div
                          class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-3 shadow-inner"
                        >
                          <svg
                            class="w-5 h-5 sm:w-6 sm:h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.8"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <h3 class="text-xs sm:text-sm font-semibold text-white">
                          No results found
                        </h3>
                        <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
                          No holdings matched your search for "<span
                            class="text-zinc-200 font-medium"
                            >{{ search }}</span
                          >".
                        </p>
                        <button
                          @click="searchInput = ''"
                          type="button"
                          class="mt-3.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg transition-colors"
                        >
                          Clear search
                        </button>
                      </template>

                      <template v-else>
                        <div class="relative mb-3.5">
                          <div
                            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-blue-500/10 to-blue-600/5 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5"
                          >
                            <svg
                              class="w-6 h-6 sm:w-7 sm:h-7"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.6"
                                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div
                            class="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] sm:text-[11px] font-bold ring-4 ring-zinc-900"
                          >
                            +
                          </div>
                        </div>

                        <h3
                          class="text-sm sm:text-base font-semibold text-white"
                        >
                          No assets in portfolio yet
                        </h3>
                        <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Start tracking your crypto investments, real-time
                          profits, and coin allocations.
                        </p>

                        <button
                          @click="openAddModal"
                          type="button"
                          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
                        >
                          <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2.2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add Your First Asset
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Server-Side Pagination Bar -->
        <div
          v-if="pagination.totalRecords > 0"
          class="px-4 sm:px-6 py-3.5 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400"
        >
          <div>
            Page
            <span class="text-white font-mono font-semibold">{{
              pagination.currentPage
            }}</span>
            of
            <span class="text-white font-mono font-semibold">{{
              pagination.totalPages || 1
            }}</span>
            <span class="hidden sm:inline">
              ({{ pagination.totalRecords }} total transactions)</span
            >
          </div>

          <div
            class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end"
          >
            <button
              :disabled="page <= 1 || isLoading"
              @click="changePage(page - 1)"
              class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-center"
            >
              Previous
            </button>
            <button
              :disabled="page >= pagination.totalPages || isLoading"
              @click="changePage(page + 1)"
              class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-center"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Asset Modal -->
    <UiModal
      v-model="isAssetModalOpen"
      :title="
        selectedAssetToEdit ? 'Edit Asset Holding' : 'Add New Crypto Asset'
      "
      max-width="max-w-md"
    >
      <PortfolioAssetFormModal
        :coinsList="topCoins"
        :assetToEdit="selectedAssetToEdit"
        @cancel="closeAssetModal"
        @success="handleAssetSaved"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      v-model="isDeleteModalOpen"
      title="Delete Asset"
      max-width="max-w-sm"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div class="text-xs leading-5">
            <p class="text-white font-medium">
              Are you sure you want to remove
              <span class="text-red-400 font-semibold">{{
                assetToDelete?.name
              }}</span
              >?
            </p>
            <p class="text-gray-400 mt-1">
              This will remove this asset entry from your portfolio.
            </p>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800"
        >
          <button
            type="button"
            :disabled="isDeleting"
            @click="isDeleteModalOpen = false"
            class="px-3.5 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isDeleting"
            @click="confirmDelete"
            class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
          >
            {{ isDeleting ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";

const {
  tableAssets,
  analyticsAssets,
  summary,
  pagination,
  isLoading,
  isRefreshing,
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  fetchPortfolio,
  startAutoRefresh,
  stopAutoRefresh,
  removeAsset,
} = usePortfolio();

const chartRef = ref();

const showAnalytics = ref(true);
const searchInput = ref("");

watchDebounced(
  searchInput,
  (val: string) => {
    search.value = val.trim();
    page.value = 1;
    fetchPortfolio(false);
  },
  { debounce: 400 },
);

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  fetchPortfolio(false);
};

const changePage = (newPage: number) => {
  page.value = newPage;
  fetchPortfolio(false);
};

const { data: topCoins } = await useFetch("/api/coins/top", {
  default: () => [],
});

const isDeleteModalOpen = ref(false);
const assetToDelete = ref<{ id: number; name: string; symbol: string } | null>(
  null,
);
const isDeleting = ref(false);

const openDeleteModal = (asset: {
  id: number;
  name: string;
  symbol: string;
}) => {
  assetToDelete.value = asset;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!assetToDelete.value) return;
  isDeleting.value = true;
  await removeAsset(assetToDelete.value);
  chartRef.value?.refresh();
  isDeleting.value = false;
  isDeleteModalOpen.value = false;
  assetToDelete.value = null;
};

const isAssetModalOpen = ref(false);
const selectedAssetToEdit = ref<CryptoAsset | null>(null);

const openAddModal = () => {
  selectedAssetToEdit.value = null;
  isAssetModalOpen.value = true;
};
const openEditModal = (asset: CryptoAsset) => {
  selectedAssetToEdit.value = asset;
  isAssetModalOpen.value = true;
};
const closeAssetModal = () => {
  isAssetModalOpen.value = false;
  selectedAssetToEdit.value = null;
};
const handleAssetSaved = async () => {
  closeAssetModal();
  fetchPortfolio(false);
  chartRef.value?.refresh();
};

onMounted(() => {
  fetchPortfolio(false);
  startAutoRefresh(60000);
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>
