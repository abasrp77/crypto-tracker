<template>
  <div class="w-full text-center">
    <!-- Responsive Verification Icon -->
    <div
      class="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
    >
      <svg
        class="w-6 h-6 sm:w-8 sm:h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </div>

    <h1 class="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
      Check Your Email
    </h1>
    <p class="text-xs sm:text-sm text-gray-400 mb-5 sm:mb-6 leading-relaxed">
      We sent a 6-digit code and a verification link to <br />
      <span class="text-white font-medium break-all">{{
        userEmail || "your email"
      }}</span>
    </p>

    <UiCollapse>
      <div
        v-if="errorMessage"
        class="mb-5 sm:mb-6 p-2.5 sm:p-3 rounded-xl bg-crypto-red/10 border border-crypto-red/30 text-crypto-red text-xs sm:text-sm"
      >
        {{ errorMessage }}
      </div>
    </UiCollapse>

    <form @submit.prevent="verifyWithCode" class="space-y-4">
      <!-- 6-digit OTP code inputs formatted for mobile viewports -->
      <UiInput
        v-model="code"
        label="Enter 6-Digit Code"
        type="text"
        inputmode="numeric"
        maxlength="6"
        placeholder="000000"
        :disabled="isSubmitting || timer === 0"
        inputClass="text-center text-xl sm:text-2xl font-bold tracking-[6px] sm:tracking-[8px]"
        @paste="handlePaste"
      />

      <button
        type="submit"
        :disabled="isSubmitting || code.length !== 6 || timer === 0"
        class="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-base font-medium transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        <span v-if="!isSubmitting && timer > 0">Verify Account</span>
        <span v-else-if="timer === 0">Code Expired</span>
        <span v-else>Verifying...</span>
      </button>
    </form>

    <!-- Resend code section -->
    <div
      class="mt-6 pt-5 sm:pt-6 border-t border-dark-600 flex flex-col xs:flex-row items-center justify-between gap-2 text-xs sm:text-sm"
    >
      <span class="text-gray-400">Didn't receive the email?</span>

      <button
        @click="resendCode"
        :disabled="timer > 0 || isResending"
        class="text-primary hover:text-primary-hover font-medium transition disabled:text-gray-500 disabled:cursor-not-allowed py-1"
      >
        <span v-if="isResending">Sending...</span>
        <p v-else-if="timer > 0" class="flex items-center">
          Resend in <span class="w-8 text-center">{{ formattedTimer }}</span>
        </p>
        <span v-else>Resend Code</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const route = useRoute();
const { user } = useAuth();

const code = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);
const isResending = ref(false);
const userEmail = ref((route.query.email as string) || "");

const timer = ref(120);
let intervalId: ReturnType<typeof setInterval> | null = null;

const formattedTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});

const startCountdown = () => {
  timer.value = 120;
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      if (intervalId) clearInterval(intervalId);
      errorMessage.value =
        "Verification code has expired. Please request a new one.";
    }
  }, 1000);
};

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pastedText = e.clipboardData?.getData("text") || "";
  const digitsOnly = pastedText.replace(/\D/g, "").slice(0, 6);

  if (digitsOnly) {
    code.value = digitsOnly;
    // Watcher triggers verifyWithCode as soon as all 6 digits are entered
  }
};

// Auto-submit OTP code upon completion
watch(code, (newVal) => {
  const sanitized = newVal.replace(/\D/g, "");
  if (sanitized !== newVal) {
    code.value = sanitized;
  }

  if (code.value.length === 6 && timer.value > 0 && !isSubmitting.value) {
    verifyWithCode();
  }
});

onMounted(async () => {
  startCountdown();

  // Support direct verification query link
  const token = route.query.token as string;
  if (token) {
    isSubmitting.value = true;
    try {
      const res = await apiFetch("/auth/verify", {
        method: "POST",
        body: { token },
        showToast: false,
      });
      user.value = res.user;
      await navigateTo("/dashboard");
    } catch (err: any) {
      errorMessage.value =
        err?.data?.statusMessage || "Verification link is invalid or expired";
    } finally {
      isSubmitting.value = false;
    }
  }
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const verifyWithCode = async () => {
  if (code.value.length !== 6 || timer.value === 0 || isSubmitting.value)
    return;

  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    const res = await apiFetch("/auth/verify", {
      method: "POST",
      body: { code: code.value, email: userEmail.value },
      showToast: false,
    });
    user.value = res.user;
    await navigateTo("/dashboard");
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || "Invalid or expired code";
  } finally {
    isSubmitting.value = false;
  }
};

const resendCode = async () => {
  if (timer.value > 0 || !userEmail.value || isResending.value) return;
  errorMessage.value = "";
  code.value = "";
  isResending.value = true;
  try {
    await apiFetch("/auth/resend-verification", {
      method: "POST",
      body: { email: userEmail.value },
      showToast: false,
    });
    startCountdown();
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || "Failed to resend code";
  } finally {
    isResending.value = false;
  }
};
</script>
