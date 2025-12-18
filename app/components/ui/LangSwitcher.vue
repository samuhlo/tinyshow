<script setup lang="ts">
const { locale, setLocale } = useI18n();

const toggleLocale = () => {
  setLocale(locale.value === "en" ? "es" : "en");
};
</script>

<template>
  <button
    @click="toggleLocale"
    class="font-mono text-xs uppercase tracking-widest hover:text-accent transition-colors duration-200"
    aria-label="Toggle Language"
  >
    <span :class="{ 'font-bold': locale === 'es', 'text-accent': locale === 'es' }">ES</span>
    <span class="mx-1 opacity-50">//</span>
    <span :class="{ 'font-bold': locale === 'en', 'text-accent': locale === 'en' }">EN</span>
  </button>
</template>
