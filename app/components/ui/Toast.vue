<script setup lang="ts">
const { toasts, remove } = useToast();
</script>

<template>
  <div
    class="fixed top-5 left-5 z-[9999] flex flex-col pointer-events-none max-w-sm w-full"
  >
    <TransitionGroup name="toast-list" tag="div" class="flex flex-col w-full">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm backdrop-blur-md overflow-hidden"
        :class="{
          'bg-rose-500/15 border-rose-500/30 text-rose-300':
            toast.type === 'error',
          'bg-emerald-500/15 border-emerald-500/30 text-emerald-300':
            toast.type === 'success',
          'bg-amber-500/15 border-amber-500/30 text-amber-300':
            toast.type === 'warning',
          'bg-blue-500/15 border-blue-500/30 text-blue-300':
            toast.type === 'info',
        }"
      >
        <span class="leading-relaxed">{{ toast.message }}</span>
        <button
          @click="remove(toast.id)"
          class="mr-2 text-xs opacity-60 hover:opacity-100 cursor-pointer p-1"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Base spacing between toast cards */
.toast-item {
  margin-bottom: 0.5rem;
  max-height: 120px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 1. Enter animation */
.toast-list-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* 2. Re-layout transition when an item is removed */
.toast-list-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 3. Leave and collapse animation */
.toast-list-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-width: 0;
}
</style>
