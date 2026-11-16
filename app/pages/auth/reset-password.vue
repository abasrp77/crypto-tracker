<template>
  <div class="w-full">
    <div class="text-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
        Create New Password
      </h1>
      <p class="text-xs sm:text-sm text-gray-400">
        Choose a strong password for your account
      </p>
    </div>

    <!-- Missing Reset Token State -->
    <div v-if="!token" class="space-y-4">
      <div
        class="p-3.5 sm:p-4 rounded-xl bg-crypto-red/10 border border-crypto-red/30 text-crypto-red text-xs sm:text-sm text-center"
      >
        Reset token is missing or malformed.
      </div>
      <NuxtLink
        to="/auth/forgot-password"
        class="block w-full py-3 text-center rounded-xl bg-dark-700 hover:bg-dark-600 text-white text-sm sm:text-base font-medium transition active:scale-[0.99]"
      >
        Request New Link
      </NuxtLink>
    </div>

    <!-- Password Reset Success State -->
    <div v-else-if="isSuccess" class="space-y-4 text-center">
      <div
        class="p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm"
      >
        Password changed successfully! Redirecting to login...
      </div>
    </div>

    <!-- Reset Password Form -->
    <form v-else @submit.prevent="handleReset" class="space-y-4">
      <UiCollapse>
        <div
          v-if="errors.general"
          class="p-2.5 sm:p-3 rounded-xl bg-crypto-red/10 border border-crypto-red/30 text-crypto-red text-xs sm:text-sm text-center"
        >
          {{ errors.general }}
        </div>
      </UiCollapse>

      <UiInput
        v-model="form.password"
        v-model:error="errors.password"
        label="New Password"
        type="password"
        placeholder="••••••••"
        :disabled="isLoading"
        @blur="validateField('password')"
      />

      <UiInput
        v-model="form.confirmPassword"
        v-model:error="errors.confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder="••••••••"
        :disabled="isLoading"
        @blur="validateField('confirmPassword')"
      />

      <button
        type="submit"
        :disabled="isLoading || !form.password || !form.confirmPassword"
        class="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-base font-medium transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        <span v-if="!isLoading">Reset Password</span>
        <span v-else>Updating...</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  passwordSchema,
  resetPasswordFormSchema,
} from "~~/shared/schemas/auth";

const { apiFetch } = useApi();
const route = useRoute();
const token = computed(() => (route.query.token as string) || "");

const form = reactive({
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  password: "",
  confirmPassword: "",
  general: "",
});

const isLoading = ref(false);
const isSuccess = ref(false);

const validateField = (field: "password" | "confirmPassword") => {
  if (field === "password") {
    const validation = passwordSchema.safeParse(form.password);
    errors.password = validation.success
      ? ""
      : validation.error.issues[0]?.message || "Invalid password";
  }

  if (
    field === "confirmPassword" ||
    (field === "password" && form.confirmPassword)
  ) {
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    } else {
      errors.confirmPassword = "";
    }
  }
};

const handleReset = async () => {
  errors.general = "";
  validateField("password");
  validateField("confirmPassword");

  if (!token.value) {
    errors.general = "Invalid or missing reset token";
    return;
  }

  // Form validation using shared Zod schema
  const validation = resetPasswordFormSchema.safeParse(form);
  if (!validation.success) {
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as "password" | "confirmPassword";
      if (field) errors[field] = issue.message;
    });
    return;
  }

  isLoading.value = true;

  try {
    await apiFetch("/auth/reset-password", {
      method: "POST",
      body: {
        token: token.value,
        password: form.password,
      },
      showToast: false,
    });

    isSuccess.value = true;
    setTimeout(() => {
      navigateTo("/auth/login");
    }, 2500);
  } catch (err: any) {
    errors.general =
      err?.data?.statusMessage ||
      "Failed to reset password. Link may be expired.";
  } finally {
    isLoading.value = false;
  }
};
</script>
