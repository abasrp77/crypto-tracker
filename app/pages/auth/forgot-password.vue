<template>
  <div class="w-full">
    <div class="text-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
        Forgot Password?
      </h1>
      <p class="text-xs sm:text-sm text-gray-400">
        Enter your registered email and we'll send you a recovery link
      </p>
    </div>

    <UiCollapse>
      <div v-if="isSubmitted" class="space-y-4">
        <div
          class="p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/30 text-center"
        >
          <p class="text-xs sm:text-sm text-gray-200">
            If an account exists for
            <span class="font-semibold text-white break-all">{{
              form.email
            }}</span
            >, you will receive a reset link shortly.
          </p>
        </div>

        <NuxtLink
          to="/auth/login"
          class="block w-full py-3 text-center rounded-xl bg-dark-700 hover:bg-dark-600 text-white text-sm sm:text-base font-medium transition active:scale-[0.99]"
        >
          Back to Login
        </NuxtLink>
      </div>
    </UiCollapse>

    <UiCollapse>
      <form
        v-if="!isSubmitted"
        @submit.prevent="handleSubmit"
        class="space-y-4"
      >
        <UiCollapse>
          <div
            v-if="errors.general"
            class="p-2.5 sm:p-3 rounded-xl bg-crypto-red/10 border border-crypto-red/30 text-crypto-red text-xs sm:text-sm text-center"
          >
            {{ errors.general }}
          </div>
        </UiCollapse>

        <UiInput
          v-model="form.email"
          v-model:error="errors.email"
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          :disabled="isLoading"
          @blur="validateField('email')"
        />

        <button
          type="submit"
          :disabled="isLoading || !form.email"
          class="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-base font-medium transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <span v-if="!isLoading">Send Reset Link</span>
          <span v-else>Sending...</span>
        </button>

        <div class="text-center pt-2">
          <NuxtLink
            to="/auth/login"
            class="text-xs sm:text-sm text-gray-400 hover:text-white transition inline-block py-1"
          >
            Remember your password?
            <span class="text-primary font-medium">Log In</span>
          </NuxtLink>
        </div>
      </form>
    </UiCollapse>
  </div>
</template>

<script setup lang="ts">
import { emailSchema } from "~~/shared/schemas/auth";

const { apiFetch } = useApi();

const form = reactive({
  email: "",
});

const errors = reactive({
  email: "",
  general: "",
});

const isLoading = ref(false);
const isSubmitted = ref(false);

const validateField = (field: "email") => {
  if (field === "email") {
    const validation = emailSchema.safeParse(form.email);
    errors.email = validation.success
      ? ""
      : validation.error.issues[0]?.message || "Invalid email address";
  }
};

const handleSubmit = async () => {
  errors.general = "";
  validateField("email");

  if (errors.email) return;

  isLoading.value = true;

  try {
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: { email: form.email },
      showToast: false,
    });
    isSubmitted.value = true;
  } catch (err: any) {
    errors.general = err?.data?.statusMessage || "Failed to send reset email";
  } finally {
    isLoading.value = false;
  }
};
</script>
