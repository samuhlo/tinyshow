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
    "@nuxtjs/google-fonts",
  ],
  srcDir: "app",
  i18n: {
    locales: [
      { code: "en", language: "en-US", file: "en.json" },
      { code: "es", language: "es-ES", file: "es.json" },
    ],
    defaultLocale: "en",
    strategy: "prefix_except_default",
    langDir: "locales",
  },
  googleFonts: {
    families: {
      // Nombre de la fuente y pesos requeridos
      Archivo: [100, 400, 700, 800],
      ArchivoBlack: [400],
      SpaceMono: [400, 600],
    },
    display: "swap", // 'swap' es vital para la UX (muestra texto fallback inmediatamente)
    download: true, // Fuerza la descarga local (GDPR compliant)
    base64: false,
  },
});
