<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      :class="isOpen ? 'pointer-events-auto' : 'pointer-events-none'"
    >
      <!-- Backdrop with Fade animation -->
      <Transition
        appear
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 bg-black/75 backdrop-blur-sm"
          @click="closeModal"
        />
      </Transition>

      <!-- Modal Window with Scale + Fade animation -->
      <Transition
        appear
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-0 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-0 translate-y-2"
      >
        <div
          v-if="isOpen"
          class="relative w-full rounded-2xl border border-dark-600 bg-dark-800 p-6 shadow-2xl text-white z-10"
          :class="maxWidth"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between pb-4 border-b border-dark-700/60"
          >
            <slot name="title">
              <h3 class="text-base font-semibold tracking-tight text-white">
                {{ title }}
              </h3>
            </slot>

            <button
              type="button"
              @click="closeModal"
              class="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-dark-700 transition focus:outline-none"
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
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Main Modal Content -->
          <div class="mt-4">
            <slot />
          </div>

          <!-- Optional Action Footer -->
          <div
            v-if="$slots.footer"
            class="mt-6 pt-4 border-t border-dark-700/60 flex items-center justify-end gap-3"
          >
            <slot name="footer" :close="closeModal" />
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  maxWidth?: string; // e.g. max-w-md or max-w-lg
}

withDefaults(defineProps<Props>(), {
  title: "",
  maxWidth: "max-w-md",
});

// Two-way open/close state binding via defineModel
const isOpen = defineModel<boolean>({ default: false });

watch(
  isOpen,
  (val) => {
    if (import.meta.client) {
      if (val) {
        document.body.classList.add("overflow-hidden");
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    }
  },
  { immediate: true },
);

const closeModal = () => {
  isOpen.value = false;
};

// vue use
onKeyStroke("Escape", (e) => {
  if (isOpen.value) {
    e.preventDefault();
    closeModal();
  }
});
</script>
