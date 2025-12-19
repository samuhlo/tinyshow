<script setup lang="ts">
/**
 * [COMPONENT] :: TECH_PILL
 * ----------------------------------------------------------------------
 * Etiqueta visual para representar una tecnología o stack.
 * Soporta temas claros y oscuros para adaptarse al contexto.
 *
 * @module    components/ui
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  text: string;
  theme?: "light" | "dark";
}

const THEME_LIGHT = "light";
const THEME_DARK = "dark";

withDefaults(defineProps<Props>(), {
  theme: THEME_LIGHT,
});
</script>

<template>
  <span
    class="inline-block px-2 py-0.5 text-xs font-mono border rounded-full transition-colors duration-200"
    :class="[
      theme === THEME_LIGHT
        ? 'border-dark text-dark'
        : 'border-white text-white',
    ]"
  >
    {{ text }}
  </span>
</template>
