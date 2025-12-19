<script setup lang="ts">
/**
 * [COMPONENT] :: BRUTAL_SPINNER
 * ----------------------------------------------------------------------
 * Spinner brutalista minimalista para estados de carga.
 * Diseño de dos bloques que rotan y se mueven en direcciones opuestas.
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

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  /**
   * Tamaño del spinner.
   * - `sm`: 24px - para hover de imágenes
   * - `md`: 36px - para listas de proyectos
   * - `lg`: 48px - para carga inicial
   */
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
});

// =====================================================================
// [SECTION] :: COMPUTED STYLES
// =====================================================================

const sizeMap = {
  sm: SIZE_SM,
  md: SIZE_MD,
  lg: SIZE_LG,
};

const spinnerStyle = computed(() => ({
  width: `${sizeMap[props.size]}px`,
  height: `${sizeMap[props.size]}px`,
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
  display: flex;
  animation: brutal-rotate 1.5s infinite linear;
}

.brutal-spinner::before,
.brutal-spinner::after {
  content: "";
  flex: 1;
  background: var(--color-dark);
  animation: brutal-mvx 0.5s infinite linear alternate;
}

.brutal-spinner::before {
  background: var(--color-accent);
  animation-name: brutal-mvrx;
}

@keyframes brutal-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes brutal-mvx {
  0% {
    transform: translateX(-30%);
  }
  100% {
    transform: translateX(30%);
  }
}

@keyframes brutal-mvrx {
  0% {
    transform: translateX(30%);
  }
  100% {
    transform: translateX(-30%);
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
