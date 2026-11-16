<template>
  <div ref="containerRef" class="relative w-full space-y-1.5 text-left">
    <label v-if="label" class="block text-xs font-medium text-gray-400">
      {{ label }}
    </label>

    <div class="relative">
      <!-- Selected item icon/image on input left side -->
      <div
        v-if="selectedItem && imageKey && selectedItem[imageKey] && !isOpen"
        class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
      >
        <NuxtImg
          :src="selectedItem[imageKey]"
          :alt="String(selectedItem[labelKey])"
          width="20"
          height="20"
          loading="lazy"
          format="webp"
          class="rounded-full flex-shrink-0"
        />
      </div>

      <input
        v-model="displayQuery"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="handleFocus"
        class="w-full rounded-xl bg-dark-700 border text-white placeholder-gray-500 focus:outline-none transition duration-200"
        :class="[
          selectedItem && imageKey && selectedItem[imageKey] && !isOpen
            ? 'pl-10 pr-9'
            : 'px-4',
          'py-2.5',
          error
            ? 'border-crypto-red focus:border-crypto-red'
            : 'border-dark-600 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ]"
      />

      <!-- Dropdown indicator arrow -->
      <div
        class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
      >
        <svg
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
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
      </div>
    </div>

    <!-- Dropdown Options List -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-dark-600 bg-dark-800 shadow-xl divide-y divide-dark-700/50"
      >
        <div
          v-for="item in filteredItems"
          :key="String(item[itemKey])"
          @click="selectItem(item)"
          class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-dark-700 cursor-pointer transition"
        >
          <NuxtImg
            v-if="imageKey && item[imageKey]"
            :src="item[imageKey]"
            :alt="String(item[labelKey])"
            loading="lazy"
            width="22"
            height="22"
            class="rounded-full flex-shrink-0"
          />
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium text-white truncate">{{
              item[labelKey]
            }}</span>
            <span
              v-if="subLabelKey && item[subLabelKey]"
              class="text-xs text-gray-400 uppercase"
            >
              {{ item[subLabelKey] }}
            </span>
          </div>
        </div>

        <div
          v-if="!filteredItems.length"
          class="px-4 py-3 text-xs text-center text-gray-400"
        >
          No matching results found
        </div>
      </div>
    </Transition>

    <!-- Error message -->
    <UiCollapse>
      <div v-if="error">
        <span class="block text-xs text-crypto-red mt-1.5 ml-1 font-medium">
          {{ error }}
        </span>
      </div>
    </UiCollapse>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
interface Props {
  items: T[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  searchFields?: (keyof T)[];
  itemKey?: keyof T;
  labelKey?: keyof T;
  subLabelKey?: keyof T;
  imageKey?: keyof T;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  placeholder: "Search or select...",
  searchFields: () => ["name", "symbol"] as any,
  itemKey: "id" as any,
  labelKey: "name" as any,
  subLabelKey: "symbol" as any,
  imageKey: "image" as any,
});

// Selected value bound to parent form
const selectedItem = defineModel<T | null>({ default: null });
const error = defineModel<string>("error", { default: "" });

const emit = defineEmits<{
  (e: "select", item: T): void;
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref<HTMLElement | null>(null);

// Display label of the input field
const displayQuery = computed({
  get: () => {
    if (isOpen.value) return searchQuery.value;
    if (!selectedItem.value) return "";
    const main = selectedItem.value[props.labelKey];
    const sub = props.subLabelKey
      ? ` (${selectedItem.value[props.subLabelKey]})`
      : "";
    return `${main}${sub}`;
  },
  set: (val: string) => {
    searchQuery.value = val;
  },
});

// Fast client-side options filtering
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  // Show all items when no query is typed to enable full scroll
  if (!q) return props.items;

  // When user searches, filter and show up to top 20 relevant results
  return props.items.filter((item) =>
    props.searchFields.some((field) => {
      const val = item[field];
      return val && String(val).toLowerCase().includes(q);
    }),
  );
});

const handleFocus = () => {
  if (props.disabled) return;
  isOpen.value = true;
  searchQuery.value = "";
};

const selectItem = (item: T) => {
  selectedItem.value = item;
  isOpen.value = false;
  if (error.value) error.value = "";
  emit("select", item);
};

// Close dropdown when clicking outside the component
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>
