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
    class="font-sans text-sm uppercase tracking-widest group cursor-pointer flex items-center gap-2"
    aria-label="Toggle Language"
  >
    <span
      class="transition-all duration-300 transform"
      :class="locale !== LOCALE_ES ? 'scale-75' : 'text-accent scale-110 font-bold'"
    >ES</span>
    
    <span>//</span>
    
    <span
      class="transition-all duration-300 transform"
      :class="locale !== LOCALE_EN ? 'scale-75' : 'text-accent scale-110 font-bold'"
    >EN</span>
  </button>
</template>
