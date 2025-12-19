<script setup lang="ts">
/**
 * [COMPONENT] :: LANG_SWITCHER
 * ----------------------------------------------------------------------
 * Selector de idioma minimalista.
 * Gestiona la conmutación entre ES y EN preservando la ruta actual.
 *
 * @module    components/ui
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

// =====================================================================
// [SECTION] :: INTERACTION HANDLERS
// =====================================================================

/**
 * [HANDLE] :: TOGGLE_LOCALE
 * Alterna el idioma de la aplicación y navega a la ruta equivalente.
 */
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
