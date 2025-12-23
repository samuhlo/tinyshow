<script setup lang="ts">
/**
 * [COMPONENT] :: THEME_SWITCHER
 * ----------------------------------------------------------------------
 * Botón para alternar entre modo claro y oscuro.
 * Sigue el mismo estilo minimalista que el LangSwitcher.
 *
 * @module    components/ui
 * @architect Antigravity
 * ----------------------------------------------------------------------
 */

import { useTheme } from "~/composables/useTheme";

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    @click="toggleTheme"
    class="font-sans text-sm uppercase tracking-widest group cursor-pointer flex items-center gap-2"
    aria-label="Toggle Theme"
  >
    <!-- Icono Sol (Light) -->
    <span 
      class="transition-all duration-300 transform"
      :class="isDark ? 'scale-75' : 'text-accent scale-110 font-bold'"
    >
      LGT
    </span>
    
    <span >//</span>

    <!-- Icono Luna (Dark) -->
    <span 
      class="transition-all duration-300 transform"
      :class="!isDark ? 'scale-75' : 'text-accent scale-110 font-bold'"
    >
      DRK
    </span>
  </button>
</template>
