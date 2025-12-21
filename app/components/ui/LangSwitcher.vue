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

const { locale, setLocale } = useI18n();

// =====================================================================
// [SECTION] :: INTERACTION HANDLERS
// =====================================================================

const LOCALE_EN = "en";
const LOCALE_ES = "es";

/**
 * [HANDLE] :: TOGGLE_LOCALE
 * Alterna el idioma de la aplicación sin recargar la página.
 * Usa setLocale para cambio reactivo (sin remontado de componentes).
 */
const toggleLocale = () => {
  const newLocale = locale.value === LOCALE_EN ? LOCALE_ES : LOCALE_EN;
  setLocale(newLocale);
};
</script>

<template>
  <button
    @click="toggleLocale"
    class="font-sans text-sm uppercase tracking-widest group cursor-pointer"
    aria-label="Toggle Language"
  >
    <span
      class="inline-block hover:scale-110 hover:text-accent transition-all duration-300"
      :class="{ 'font-extrabold text-accent': locale === LOCALE_ES }"
    >ES</span>
    <span class="mx-1 ">//</span>
    <span
      class="inline-block hover:scale-110 hover:text-accent transition-all duration-300"
      :class="{ 'font-extrabold text-accent': locale === LOCALE_EN }"
    >EN</span>
  </button>
</template>
