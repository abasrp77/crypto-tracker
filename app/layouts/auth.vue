<template>
  <div
    class="w-full min-h-screen bg-dark-900 flex flex-col items-center px-4 relative overflow-x-hidden font-sans z-20"
  >
    <!-- Ambient background glows isolated in a fixed non-overflowing container -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        class="absolute -top-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <div
        class="absolute -bottom-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"
      />
    </div>

    <!-- Centered content wrapper: perfectly centered without scrollbars, scrolling naturally on low-height screens -->
    <div class="my-auto w-full flex flex-col items-center py-4 sm:py-6">
      <!-- Platform Header / Logo -->
      <div class="mb-4 sm:mb-6 flex items-center gap-2.5 sm:gap-3 relative z-10">
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30"
        >
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <span class="text-lg sm:text-xl font-bold tracking-tight text-white"
          >CryptoTracker</span
        >
      </div>

      <!-- Centered Auth Card Form -->
      <div
        class="animate-scale-in origin-center w-full max-w-[420px] bg-dark-800 border border-dark-600 rounded-2xl p-5 sm:p-7 shadow-2xl relative z-20 backdrop-blur-sm"
      >
        <Transition
          name="auth-collapse"
          mode="out-in"
          @before-leave="beforeLeave"
          @leave="leave"
          @enter="enter"
          @after-enter="afterEnter"
        >
          <slot />
        </Transition>
      </div>

      <!-- Minimal Footer -->
      <footer
        class="mt-4 sm:mt-6 text-center text-[11px] sm:text-xs text-gray-500 relative z-10"
      >
        &copy; {{ new Date().getFullYear() }} CryptoTracker. All rights reserved.
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dynamic height transition helpers for smooth accordion collapses
const beforeLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = `${element.offsetHeight}px`;
  element.style.overflow = "hidden";
};

const leave = (el: Element) => {
  const element = el as HTMLElement;
  requestAnimationFrame(() => {
    element.style.height = "0px";
    element.style.opacity = "0";
  });
};

const enter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = "0px";
  element.style.opacity = "0";
  element.style.overflow = "hidden";

  requestAnimationFrame(() => {
    element.style.height = `${element.scrollHeight}px`;
    element.style.opacity = "1";
  });
};

const afterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = "";
  element.style.overflow = "";
};
</script>

<style scoped>
.auth-collapse-enter-active,
.auth-collapse-leave-active {
  transition:
    height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease-in-out;
}
</style>
