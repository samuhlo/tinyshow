<script setup lang="ts">
/**
 * [COMPONENT] :: CLOSE_BUTTON
 * ----------------------------------------------------------------------
 * Botón de cierre reutilizable con estilos y animaciones consistentes.
 *
 * @module    components/ui
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

interface Props {
  ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
  ariaLabel: "Close",
});

const emit = defineEmits<{
  click: [payload: MouseEvent];
}>();
</script>

<template>
  <button
    class="
      ui-close-button
      cursor-pointer
      flex
      items-center
      justify-center
      text-accent
      text-4xl
      transition-transform
      duration-200
      hover:scale-110
      hover:rotate-90
      origin-center
    "
    :aria-label="ariaLabel"
    @click="(e) => emit('click', e)"
  >
    <Icon name="material-symbols:close" />
  </button>
</template>
