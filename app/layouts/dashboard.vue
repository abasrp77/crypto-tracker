<template>
  <div
    class="w-full min-h-screen bg-black text-zinc-100 font-sans flex flex-col z-50 [scrollbar-gutter:stable]"
  >
    <!-- Dashboard Top Navbar -->
    <header
      class="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40"
    >
      <div
        class="mx-auto max-w-7xl px-3.5 sm:px-6 md:px-8 h-14 sm:h-16 flex items-center justify-between"
      >
        <!-- Logo and Branding -->
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-2.5 sm:gap-3 relative z-10"
        >
          <div
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30"
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
        </NuxtLink>
        <!-- <NuxtLink
          to="/dashboard"
          class="flex items-center gap-2.5 sm:gap-3 group"
        >
          <div
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm sm:text-base"
          >
            C
          </div>
          <span
            class="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors"
          >
            CryptoTracker
          </span>
        </NuxtLink> -->

        <!-- User Profile & Logout -->
        <div class="flex items-center gap-2.5 sm:gap-4">
          <div class="hidden sm:flex flex-col text-right">
            <span
              class="text-xs font-semibold text-white truncate max-w-[140px]"
            >
              {{ user?.name || "User" }}
            </span>
            <span class="text-[11px] text-zinc-400 truncate max-w-[140px]">
              {{ user?.email }}
            </span>
          </div>

          <button
            @click="isLogoutModalOpen = true"
            class="rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span class="hidden xs:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Dashboard View Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Logout Confirmation Modal -->
    <UiModal v-model="isLogoutModalOpen" title="Log Out" max-width="max-w-sm">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <div class="text-xs leading-5">
            <p class="text-white font-medium">
              Are you sure you want to log out?
            </p>
            <p class="text-zinc-400 mt-1">
              You will need to sign in again to access and manage your crypto
              portfolio.
            </p>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800"
        >
          <button
            type="button"
            :disabled="isLoggingOut"
            @click="isLogoutModalOpen = false"
            class="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isLoggingOut"
            @click="handleLogout"
            class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50"
          >
            {{ isLoggingOut ? "Logging out..." : "Log Out" }}
          </button>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();
const { resetPortfolio } = usePortfolio();
const isLogoutModalOpen = ref(false);
const isLoggingOut = ref(false);

const handleLogout = async () => {
  isLoggingOut.value = true;
  await logout();
  isLogoutModalOpen.value = false;
  isLoggingOut.value = false;
  resetPortfolio();
};
</script>
