<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_LAYOUT
 * ----------------------------------------------------------------------
 * Layout específico para la versión móvil.
 * Estructura simplificada para pantallas pequeñas.
 *
 * @module    components/layout/MobileLayout
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */
</script>

<template>
  <div class="min-h-screen bg-light text-dark font-mono relative flex flex-col">
    <!-- Placeholder Header -->
    <header class="p-4 border-b border-dark/10">
      <div class="flex items-center justify-between">
         <span class="font-bold">TinyShow Mobile</span>
      </div>
    </header>

    <main class="w-full flex-1 p-4">
      <slot />
    </main>
    
    <!-- Placeholder Footer or Downbar -->
    <footer class="p-4 border-t border-dark/10 text-center text-xs opacity-50">
      Mobile View
    </footer>
  </div>
</template>
