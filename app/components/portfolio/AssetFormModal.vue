<template>
  <div>
    <UiCollapse>
      <div
        v-if="errorMessage"
        class="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400"
      >
        {{ errorMessage }}
      </div>
    </UiCollapse>

    <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
      <UiSelect
        v-model="selectedCoin"
        :items="coinsList"
        label="Select Crypto Asset"
        placeholder="Search top 200 coins (e.g. BTC, ETH)..."
        item-key="id"
        label-key="name"
        sub-label-key="symbol"
        image-key="image"
        :disabled="isEditMode"
        @select="handleCoinSelect"
      />

      <div class="grid grid-cols-2 gap-3">
        <UiInput
          v-model="form.amount"
          type="number"
          label="Amount"
          :placeholder="amountPlaceholder"
        />

        <UiInput
          v-model="form.buyPriceUsd"
          type="number"
          label="Buy Price (USD)"
          :placeholder="buyPricePlaceholder"
        />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          @click="emit('cancel')"
          class="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {{
            isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Add Asset"
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
export interface TopCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
}

export interface EditableAsset {
  id: number;
  coingeckoId?: string;
  symbol: string;
  name: string;
  image?: string;
  amount: number;
  buyPriceUsd: number;
  currentPrice?: number;
}

const props = defineProps<{
  coinsList: TopCoin[];
  assetToEdit?: EditableAsset | null;
}>();

const emit = defineEmits<{
  (e: "success"): void;
  (e: "cancel"): void;
}>();

const { apiFetch } = useApi();

const isEditMode = computed(() => !!props.assetToEdit);

const selectedCoin = ref<TopCoin | null>(null);
const errorMessage = ref("");
const isSubmitting = ref(false);

const form = reactive({
  amount: undefined as number | undefined,
  buyPriceUsd: undefined as number | undefined,
});

const toast = useToast();

// Populate initial values when editing an asset
watch(
  () => props.assetToEdit,
  (asset) => {
    if (asset) {
      form.amount = asset.amount;
      form.buyPriceUsd = asset.buyPriceUsd;
      selectedCoin.value = {
        id: asset.coingeckoId || asset.symbol.toLowerCase(),
        symbol: asset.symbol,
        name: asset.name,
        image: asset.image || "",
        currentPrice: asset.currentPrice || asset.buyPriceUsd,
      };
    } else {
      form.amount = undefined;
      form.buyPriceUsd = undefined;
      selectedCoin.value = null;
    }
  },
  { immediate: true },
);

const buyPricePlaceholder = computed(() => {
  if (selectedCoin.value?.currentPrice) {
    return `e.g. ${selectedCoin.value.currentPrice.toLocaleString()}`;
  }
  return "0.00";
});

const amountPlaceholder = computed(() => {
  if (selectedCoin.value?.symbol) {
    return `0.00 ${selectedCoin.value.symbol}`;
  }
  return "0.00";
});

const handleCoinSelect = (coin: TopCoin) => {
  if (!isEditMode.value) {
    form.buyPriceUsd = coin.currentPrice;
  }
};

const handleSubmit = async () => {
  if (!selectedCoin.value) {
    errorMessage.value = "Please select a crypto asset";
    return;
  }

  if (form.amount === undefined || form.amount === null || form.amount <= 0) {
    errorMessage.value = "Please enter a valid amount.";
    return;
  }

  if (
    form.buyPriceUsd === undefined ||
    form.buyPriceUsd === null ||
    form.buyPriceUsd < 0
  ) {
    errorMessage.value = "Please enter a valid purchase price.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    if (isEditMode.value && props.assetToEdit) {
      // Update asset request
      await apiFetch(`/portfolio/asset/${props.assetToEdit.id}`, {
        method: "PUT",
        body: {
          amount: Number(form.amount),
          buyPriceUsd: Number(form.buyPriceUsd),
        },
        showToast: false,
      });
      toast.success(
        `Successfully updated your ${props.assetToEdit.symbol} holding.`,
      );
    } else {
      await apiFetch("/portfolio/asset", {
        method: "POST",
        body: {
          coingeckoId: selectedCoin.value.id,
          symbol: selectedCoin.value.symbol,
          name: selectedCoin.value.name,
          image: selectedCoin.value.image,
          amount: Number(form.amount),
          buyPriceUsd: Number(form.buyPriceUsd),
        },
        showToast: false,
      });
      toast.success(
        `Successfully added ${form.amount} ${selectedCoin.value.symbol} to your portfolio.`,
      );
    }

    emit("success");
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || "Failed to save asset";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
