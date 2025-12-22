import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
  ],

  runtimeConfig: {
    neonDatabaseUrl: process.env.NEON_DATABASE_URL,
  },

  srcDir: "app",
  i18n: {
    locales: [
      { code: "en", language: "en-US", file: "en.json" },
      { code: "es", language: "es-ES", file: "es.json" },
    ],
    defaultLocale: "en",
    strategy: "no_prefix",
    langDir: "locales",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      fallbackLocale: "en",
    },
  },
});