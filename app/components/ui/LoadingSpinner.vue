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
// [SECTION] :: COMPUTED CLASSES
// =====================================================================

const sizeClasses = {
  sm: 'w-6 h-6 border-[3px]',
  md: 'w-9 h-9 border-4',
  lg: 'w-12 h-12 border-[5px]',
};

const colorClasses = {
  dark: 'border-dark',
  light: 'border-light',
  accent: 'border-accent',
};

const spinnerClasses = computed(() => {
  return [
    'inline-block rounded-full border-solid animate-spin border-b-transparent box-border',
    sizeClasses[props.size],
    colorClasses[props.color],
  ];
});
</script>

<template>
  <span 
    :class="spinnerClasses"
    role="status"
    aria-label="Loading"
  >
    <span class="sr-only">Loading...</span>
  </span>
</template>
