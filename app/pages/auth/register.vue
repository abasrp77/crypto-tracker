<template>
  <div class="w-full">
    <div class="text-center mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-white mb-1.5">
        Create an Account
      </h1>
      <p class="text-xs sm:text-sm text-gray-400">
        Track and manage your crypto portfolio seamlessly
      </p>
    </div>

    <!-- General Server Error -->
    <UiCollapse>
      <div v-if="generalError" class="mb-4">
        <div
          class="p-2.5 sm:p-3 rounded-lg bg-crypto-red/10 border border-crypto-red/30 text-crypto-red text-xs sm:text-sm text-center"
        >
          {{ generalError }}
        </div>
      </div>
    </UiCollapse>

    <form @submit.prevent="handleRegister" class="space-y-3 sm:space-y-3.5">
      <UiInput
        v-model="form.name"
        v-model:error="errors.name"
        label="Full Name"
        placeholder="e.g. John Doe"
        @blur="validateField('name')"
      />

      <UiInput
        v-model="form.email"
        v-model:error="errors.email"
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        @blur="validateField('email')"
      />

      <UiInput
        v-model="form.password"
        v-model:error="errors.password"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        @blur="validateField('password')"
      />

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full mt-1.5 py-2.5 sm:py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-base font-medium shadow-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        <span v-if="!isLoading">Sign Up</span>
        <span v-else class="flex items-center gap-2">Creating account...</span>
      </button>
    </form>

    <div class="relative my-4 sm:my-5">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-dark-600"></div>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-dark-800 px-3 text-gray-400 font-mono tracking-wider">
          or
        </span>
      </div>
    </div>

    <!-- Google OAuth Sign-In Button -->
    <a
      href="/auth/google"
      class="w-full py-3 px-4 rounded-xl bg-dark-700/60 hover:bg-dark-700 border border-dark-600 hover:border-slate-600 text-white text-xs sm:text-sm font-medium transition duration-200 flex items-center justify-center gap-3 shadow-md active:scale-[0.99]"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Continue with Google</span>
    </a>

    <p class="mt-6 text-center text-xs sm:text-sm text-gray-400">
      Already have an account?
      <NuxtLink
        to="/auth/login"
        class="text-primary hover:underline font-medium inline-block py-1"
      >
        Log in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { registerSchema } from "~~/shared/schemas/auth";

const { register } = useAuth();

const form = reactive({
  name: "",
  email: "",
  password: "",
});

const isLoading = ref(false);
const generalError = ref("");
const errors = reactive({
  name: "",
  email: "",
  password: "",
});

const validateField = (field: "name" | "email" | "password") => {
  generalError.value = "";
  const validation = registerSchema.shape[field].safeParse(form[field]);
  if (!validation.success) {
    errors[field] = validation.error.issues[0]?.message || "";
  } else {
    errors[field] = "";
  }
};

const handleRegister = async () => {
  generalError.value = "";

  const validation = registerSchema.safeParse(toRaw(form));
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    errors.name = fieldErrors.name?.[0] || "";
    errors.email = fieldErrors.email?.[0] || "";
    errors.password = fieldErrors.password?.[0] || "";
    return;
  }

  isLoading.value = true;
  try {
    await register(form);
    await navigateTo(
      `/auth/verify-email?email=${encodeURIComponent(form.email)}`,
    );
  } catch (err: any) {
    generalError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      "Registration failed. Please check your credentials.";
  } finally {
    isLoading.value = false;
  }
};
</script>
