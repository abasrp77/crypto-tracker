import type { NuxtPage } from "nuxt/schema";

export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
    "@vueuse/nuxt",
    "nuxt-auth-utils",
  ],
  image: {
    domains: ["coin-images.coingecko.com", "assets.coingecko.com"],
  },
  compatibilityDate: "2025-07-15",
  // devtools: { enabled: true },
  hooks: {
    "pages:extend"(pages: NuxtPage[]) {
      function configureRoutes(routes: NuxtPage[]) {
        for (const route of routes) {
          route.meta = route.meta || {};

          if (route.path.startsWith("/dashboard")) {
            route.meta.layout = "dashboard";

            const currentMw = Array.isArray(route.meta.middleware)
              ? route.meta.middleware
              : route.meta.middleware
                ? [route.meta.middleware]
                : [];

            if (!currentMw.includes("auth")) {
              route.meta.middleware = [...currentMw, "auth"];
            }
          }

          if (route.path.startsWith("/auth")) {
            route.meta.layout = "auth";

            const currentMw = Array.isArray(route.meta.middleware)
              ? route.meta.middleware
              : route.meta.middleware
                ? [route.meta.middleware]
                : [];

            if (!currentMw.includes("guest")) {
              route.meta.middleware = [...currentMw, "guest"];
            }
          }

          if (route.children && route.children.length > 0) {
            configureRoutes(route.children);
          }
        }
      }

      configureRoutes(pages);
    },
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    cronSecret: process.env.CRON_SECRET,
    public: {
      apiBase: "/api",
      appUrl:
        process.env.NUXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        "http://localhost:3000",
    },
  },
  app: {
    pageTransition: false,
    layoutTransition: true, // { name: "slide-over", mode: "in-out" },
  },
  vite: {
    server: {
      allowedHosts: true, // Allow all Ngrok tunnel hostnames
    },
  },
});
