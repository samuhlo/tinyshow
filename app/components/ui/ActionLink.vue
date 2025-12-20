<script setup lang="ts">
/**
 * [COMPONENT] :: ACTION_LINK
 * ----------------------------------------------------------------------
 * Enlace/botón con estilo brutalista para acciones principales.
 * Implementa underline con color accent y efecto hover.
 *
 * @module    components/ui
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  href: string;
  label: string;
  icon?: string;
  external?: boolean;
}

withDefaults(defineProps<Props>(), {
  external: true,
});
</script>

<template>
  <a
    :href="href"
    class="action-link group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-light transition-colors duration-200"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <!-- Icon (optional) -->
    <Icon v-if="icon" :name="icon" class="text-base" />
    
    <!-- Label with underline effect -->
    <span class="relative">
      {{ label }}
      <!-- Underline accent -->
      <span 
        class="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-accent transition-all duration-300 ease-out group-hover:w-full"
      />
    </span>
  </a>
</template>
