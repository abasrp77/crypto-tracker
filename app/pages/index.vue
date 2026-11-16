<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28 pb-16">
    <!-- ==================== 1. HERO SECTION ==================== -->
    <section class="text-center pt-2 sm:pt-6 flex flex-col items-center">
      <!-- Hero Badge (Full-Stack Portfolio Project) -->
      <div
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/25 shadow-sm mb-6"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        <span>Full-Stack Portfolio Project • Nuxt 4 & Prisma</span>
      </div>

      <!-- Hero Heading with Balanced Typography -->
      <h1
        class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.16] max-w-4xl mx-auto"
      >
        Track, Analyze & Master Your Crypto Portfolio
        <span
          class="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-400 via-primary to-indigo-400 bg-clip-text text-transparent"
        >
          with Real-Time Precision.
        </span>
      </h1>

      <!-- Hero Subtitle -->
      <p
        class="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mt-5 sm:mt-6"
      >
        A production-ready crypto wealth tracker engineered with live CoinGecko pricing,
        automated P&amp;L analytics, weighted cost computations, and secure multi-user authentication.
      </p>

      <!-- Primary CTA Buttons -->
      <div
        class="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-8 w-full sm:w-auto"
      >
        <button
          @click="handleDemoLaunch"
          :disabled="isDemoLoading"
          class="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-dark-900 font-bold text-sm transition-all duration-200 shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait cursor-pointer"
        >
          <span v-if="!isDemoLoading">Launch Live Demo</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-dark-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Entering Demo...
          </span>
          <span v-if="!isDemoLoading" class="text-base">→</span>
        </button>

        <button
          @click="scrollToFeatures"
          type="button"
          class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-dark-800/80 hover:bg-dark-700 text-slate-300 hover:text-white font-semibold text-sm border border-dark-600/80 hover:border-slate-500 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Explore Capabilities</span>
          <span class="text-xs text-slate-400">↓</span>
        </button>
      </div>

      <!-- 3D Perspective Showcase Container -->
      <div class="mt-12 sm:mt-16 w-full max-w-4xl mx-auto relative px-2 sm:px-0">
        <!-- Ambient Glow Behind Preview Frame -->
        <div
          class="absolute -inset-x-6 -top-12 h-64 bg-primary/20 rounded-full blur-[90px] -z-10 pointer-events-none"
        ></div>

        <!-- Glassmorphic Browser Preview Window -->
        <div
          class="relative rounded-2xl sm:rounded-3xl border border-dark-600/70 bg-dark-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden [transform:perspective(1200px)_rotateX(5deg)] sm:[transform:perspective(1400px)_rotateX(7deg)] transition-all duration-700 hover:[transform:perspective(1400px)_rotateX(1deg)] group"
        >
          <!-- Browser Window Header Controls -->
          <div
            class="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-dark-700/80 bg-dark-900/90 backdrop-blur-md"
          >
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
            </div>

            <div
              class="flex items-center gap-2 px-3 sm:px-4 py-1 rounded-lg bg-dark-800 border border-dark-700 text-[11px] font-mono text-slate-400"
            >
              <span class="text-emerald-400 text-xs">🔒</span>
              <span class="text-slate-200">cryptotracker.app</span>
              <span class="text-slate-500">/dashboard</span>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-400 font-mono hidden sm:flex">
              <span>Live Engine</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>

          <!-- Dashboard Preview Image with Fade Mask -->
          <div class="relative overflow-hidden bg-dark-900 max-h-[380px] sm:max-h-[480px]">
            <img
              src="/images/dashboard-preview.jpg"
              alt="CryptoTracker Dashboard Preview"
              class="w-full h-auto object-cover object-top block transition-transform duration-700 group-hover:scale-[1.01]"
              loading="lazy"
            />

            <!-- Gradient Fade to Blend with Background -->
            <div
              class="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent pointer-events-none"
            ></div>

            <!-- Floating Metric Badge -->
            <div
              class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full bg-dark-800/95 border border-primary/30 backdrop-blur-xl shadow-xl text-xs font-semibold text-slate-200 whitespace-nowrap"
            >
              <span class="w-2 h-2 rounded-full bg-crypto-green animate-pulse"></span>
              <span>Real-time CoinGecko Sync • Live Performance Graph</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 2. TECH STACK STRIP ==================== -->
    <section class="border-y border-dark-700/70 py-8">
      <p class="text-center text-xs font-mono uppercase tracking-widest text-slate-400 mb-6">
        Engineered with a Modern Full-Stack Architecture
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300">
        <div class="px-3.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Nuxt 4</span>
        </div>
        <div class="px-3.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Vue 3</span>
        </div>
        <div class="px-3.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>TypeScript</span>
        </div>
        <div class="px-3.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>Prisma ORM</span>
        </div>
        <div class="px-3.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Tailwind CSS</span>
        </div>
        <div class="px-3.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>Chart.js</span>
        </div>
        <div class="px-3.5 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Zod Validation</span>
        </div>
      </div>
    </section>

    <!-- ==================== 3. CORE CAPABILITIES (FEATURES) ==================== -->
    <section id="features" class="space-y-12">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Core Capabilities
        </div>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Everything Needed for Serious Crypto Analytics
        </h2>
        <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
          Designed from database schema to responsive components to deliver fast, accurate, and reliable portfolio insights.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <!-- Feature 1 -->
        <div
          class="p-6 sm:p-8 rounded-2xl bg-dark-800/80 border border-dark-700/80 hover:border-primary/40 transition-all duration-300 group"
        >
          <div
            class="w-12 h-12 rounded-xl bg-blue-500/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xl mb-5 group-hover:scale-105 transition-transform"
          >
            ⚡
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Real-Time Market Data Engine</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Direct integration with the CoinGecko API featuring an intelligent in-memory TTL caching layer. Provides instant live valuation without hitting external rate limits.
          </p>
        </div>

        <!-- Feature 2 -->
        <div
          class="p-6 sm:p-8 rounded-2xl bg-dark-800/80 border border-dark-700/80 hover:border-primary/40 transition-all duration-300 group"
        >
          <div
            class="w-12 h-12 rounded-xl bg-emerald-500/10 text-crypto-green border border-crypto-green/20 flex items-center justify-center font-bold text-xl mb-5 group-hover:scale-105 transition-transform"
          >
            📈
          </div>
          <h3 class="text-lg font-bold text-white mb-2">P&amp;L &amp; Weighted Cost Calculation</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Mathematical calculations that compute dollar-cost averaging (DCA), weighted average buy prices, all-time net returns, and percentage yields per asset and across the entire portfolio.
          </p>
        </div>

        <!-- Feature 3 -->
        <div
          class="p-6 sm:p-8 rounded-2xl bg-dark-800/80 border border-dark-700/80 hover:border-primary/40 transition-all duration-300 group"
        >
          <div
            class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xl mb-5 group-hover:scale-105 transition-transform"
          >
            🥧
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Visual Asset Allocation &amp; Insights</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Clean Chart.js donut distributions, portfolio risk metrics, stablecoin reserve monitoring, and top-performer detection to keep your asset allocation balanced.
          </p>
        </div>

        <!-- Feature 4 -->
        <div
          class="p-6 sm:p-8 rounded-2xl bg-dark-800/80 border border-dark-700/80 hover:border-primary/40 transition-all duration-300 group"
        >
          <div
            class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xl mb-5 group-hover:scale-105 transition-transform"
          >
            🔐
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Production Authentication &amp; Security</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Complete authentication flow built with Bcrypt password hashing, JWT in secure HttpOnly cookies, Nodemailer email verification, password reset tokens, and Zod schema validations.
          </p>
        </div>
      </div>
    </section>

    <!-- ==================== 4. ARCHITECTURAL HIGHLIGHTS ==================== -->
    <section class="rounded-3xl bg-dark-800/50 border border-dark-700/80 p-8 sm:p-12 relative overflow-hidden">
      <div class="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-dark-700">
        <div class="pt-4 md:pt-0">
          <div class="text-3xl sm:text-4xl font-extrabold text-white font-mono">100%</div>
          <div class="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Type-Safe End-to-End</div>
          <p class="text-xs text-slate-500 mt-2">Shared Zod schemas &amp; TypeScript interfaces</p>
        </div>

        <div class="pt-6 md:pt-0">
          <div class="text-3xl sm:text-4xl font-extrabold text-primary font-mono">&lt; 100ms</div>
          <div class="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Cached Response Time</div>
          <p class="text-xs text-slate-500 mt-2">In-memory TTL price caching engine</p>
        </div>

        <div class="pt-6 md:pt-0">
          <div class="text-3xl sm:text-4xl font-extrabold text-crypto-green font-mono">RESTful</div>
          <div class="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Modular Nitro Endpoints</div>
          <p class="text-xs text-slate-500 mt-2">Clean separation of controllers, services &amp; utils</p>
        </div>
      </div>
    </section>

    <!-- ==================== 5. BOTTOM CTA BANNER ==================== -->
    <section
      class="text-center p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-dark-800 to-dark-900 border border-dark-700 relative overflow-hidden"
    >
      <div class="max-w-xl mx-auto space-y-5">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Ready to Experience the Live Dashboard?
        </h2>
        <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
          Test the portfolio analytics, add custom crypto assets, and inspect the real-time order-flow computations.
        </p>
        <div class="pt-2">
          <button
            @click="handleDemoLaunch"
            :disabled="isDemoLoading"
            class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-dark-900 font-bold text-sm transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 disabled:opacity-75 disabled:cursor-wait cursor-pointer"
          >
            <span v-if="!isDemoLoading">Launch Portfolio Demo</span>
            <span v-else>Entering Demo...</span>
            <span v-if="!isDemoLoading" class="text-base">→</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ==================== 6. FOOTER ==================== -->
    <footer class="text-center pt-4 border-t border-dark-700/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div>
        <span>Crypto Tracker • Developed as a Full-Stack Showcase</span>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/auth/login" class="hover:text-slate-300 transition">Sign In</NuxtLink>
        <NuxtLink to="/auth/register" class="hover:text-slate-300 transition">Register</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { loginAsDemo } = useAuth();
const isDemoLoading = ref(false);

const handleDemoLaunch = async () => {
  if (isDemoLoading.value) return;
  isDemoLoading.value = true;
  try {
    await loginAsDemo();
    await navigateTo("/dashboard");
  } catch (err) {
    console.error("Demo login error:", err);
    await navigateTo("/auth/login");
  } finally {
    isDemoLoading.value = false;
  }
};

const scrollToFeatures = () => {
  const el = document.getElementById("features");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
</script>
