<script setup lang="ts">
/**
 * [COMPONENT] :: BRUTAL_SPINNER
 * ----------------------------------------------------------------------
 * Spinner de carga simple y circular.
 * Adaptado a los colores del proyecto.
 *
 * @module    components/ui
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

// =====================================================================
// [SECTION] :: DESIGN TOKENS
// =====================================================================

const SIZE_SM = 24;
const SIZE_MD = 36;
const SIZE_LG = 48;

const BORDER_SM = 3;
const BORDER_MD = 4;
const BORDER_LG = 5;

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  /**
   * Tamaño del spinner.
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Color del spinner.
   */
  color?: 'dark' | 'light' | 'accent';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'dark', // Default to dark for light backgrounds
});

// =====================================================================
// [SECTION] :: COMPUTED STYLES
// =====================================================================

const sizeMap = {
  sm: SIZE_SM,
  md: SIZE_MD,
  lg: SIZE_LG,
};

const borderMap = {
  sm: BORDER_SM,
  md: BORDER_MD,
  lg: BORDER_LG,
};

const colorMap = {
  dark: 'var(--color-dark)',
  light: 'var(--color-light)',
  accent: 'var(--color-accent)',
};

const spinnerStyle = computed(() => ({
  width: `${sizeMap[props.size]}px`,
  height: `${sizeMap[props.size]}px`,
  borderWidth: `${borderMap[props.size]}px`,
  borderColor: colorMap[props.color],
  borderBottomColor: 'transparent',
}));
</script>

<template>
  <span 
    class="brutal-spinner"
    :style="spinnerStyle"
    role="status"
    aria-label="Loading"
  >
    <span class="sr-only">Loading...</span>
  </span>
</template>

<style scoped>
.brutal-spinner {
  border-style: solid;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
