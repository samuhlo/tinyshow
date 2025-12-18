<script setup lang="ts">
const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const toggleLocale = async () => {
  const newLocale = locale.value === "en" ? "es" : "en";
  await navigateTo(switchLocalePath(newLocale));
};
</script>

<template>
  <button
    @click="toggleLocale"
    class="font-sans text-sm uppercase tracking-widest group"
    aria-label="Toggle Language"
  >
    <span
      class="inline-block hover:scale-110 hover:text-accent transition-all duration-300"
      :class="{ 'font-extrabold text-accent': locale === 'es' }"
    >ES</span>
    <span class="mx-1 ">//</span>
    <span
      class="inline-block hover:scale-110 hover:text-accent transition-all duration-300"
      :class="{ 'font-extrabold text-accent': locale === 'en' }"
    >EN</span>
  </button>
</template>
