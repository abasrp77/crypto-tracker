<!-- layouts/landing.vue -->
<template>
  <div
    class="min-h-screen w-full bg-dark-950 text-white flex flex-col font-sans selection:bg-primary/30 z-10"
  >
    <!-- Navbar with Primary Accent -->
    <header
      class="h-16 border-b border-dark-800/80 px-4 sm:px-6 lg:px-12 flex items-center justify-between shrink-0 bg-dark-950/80 backdrop-blur-md z-20"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.15)]"
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <span class="font-bold text-lg tracking-wide text-white">
          Crypto<span class="text-primary">Tracker</span>
        </span>
      </div>

      <!-- Sign-In button matching brand palette -->
      <NuxtLink
        to="/auth/login"
        class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
      >
        Sign In →
      </NuxtLink>
    </header>

    <!-- Live Crypto Market Marquee -->
    <LandingMarketTicker />

    <!-- Main Page Content -->
    <main
      class="flex-1 relative flex flex-col items-center overflow-x-hidden overflow-y-auto py-6 sm:py-8"
    >
      <slot />
    </main>
  </div>
</template>
