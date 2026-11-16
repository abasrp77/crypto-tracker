<template>
  <label class="block w-full text-left space-y-1.5 cursor-text">
    <span v-if="label" class="block text-xs font-medium text-gray-400">
      {{ label }}
    </span>

    <div class="relative">
      <input
        :value="displayValue"
        :type="computedType"
        :inputmode="type === 'number' ? 'decimal' : undefined"
        :placeholder="placeholder"
        @input="handleInput"
        @blur="$emit('blur')"
        class="w-full px-4 py-2.5 rounded-xl bg-dark-700 border text-white placeholder-gray-500 focus:outline-none transition duration-200"
        :class="[
          error
            ? 'border-crypto-red focus:border-crypto-red'
            : 'border-dark-600 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          { 'pr-11': isPassword },
          inputClass,
        ]"
        :disabled="disabled"
        :maxlength="maxlength"
        v-bind="$attrs"
      />
      <button
        v-if="isPassword"
        type="button"
        tabindex="-1"
        :disabled="disabled"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1 focus:outline-none disabled:opacity-50"
      >
        <svg
          v-if="!showPassword"
          class="w-5 h-5 text-gray-400 hover:text-white transition"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>

        <svg
          v-else
          class="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    </div>

    <UiCollapse>
      <div v-if="error">
        <span class="block text-xs text-crypto-red mt-1.5 ml-1 font-medium">
          {{ error }}
        </span>
      </div>
    </UiCollapse>
  </label>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  inputClass?: string;
  maxlength?: string | number;
}

// defineModel for input value and error state
const modelValue = defineModel<string | number>({ default: "" });
const error = defineModel<string>("error", { default: "" });

const {
  label = "",
  placeholder = "",
  type = "text",
  disabled = false,
  inputClass = "",
  maxlength = "100",
} = defineProps<Props>();

defineEmits<{
  (e: "blur"): void;
}>();

const showPassword = ref(false);
const isPassword = computed(() => type === "password");

// Prevent native browser number input formatting bugs when displaying commas
const computedType = computed(() => {
  if (isPassword.value) {
    return showPassword.value ? "text" : "password";
  }
  if (type === "number") {
    return "text";
  }
  return type;
});

const formatWithCommas = (val: string | number | null | undefined): string => {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).replace(/,/g, "");
  const parts = str.split(".");
  parts[0] = parts[0]!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const displayValue = computed(() => {
  if (type === "number") {
    return formatWithCommas(modelValue.value);
  }
  return modelValue.value ?? "";
});

const handleInput = (event: Event) => {
  if (error.value) {
    error.value = "";
  }
  const target = event.target as HTMLInputElement;
  const rawVal = target.value;

  if (type === "number") {
    // Strip all non-numeric characters except a single decimal point
    let sanitized = rawVal.replace(/[^0-9.]/g, "");
    const dots = sanitized.split(".");
    if (dots.length > 2) {
      sanitized = `${dots[0]}.${dots.slice(1).join("")}`;
    }

    // Directly update the model value
    modelValue.value = sanitized;
    // Real-time comma-formatted display while typing
    target.value = formatWithCommas(sanitized);
  } else {
    modelValue.value = rawVal;
  }
};
</script>
