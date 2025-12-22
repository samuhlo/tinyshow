<script setup lang="ts">
/**
 * [APP] :: ROOT_ENTRY
 * ----------------------------------------------------------------------
 * Componente raíz de la aplicación Nuxt.
 * Actúa únicamente como contenedor para el sistema de páginas y notificaciones.
 * Gestiona el estado de carga inicial (hidratación + fuentes).
 *
 * @module    app
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

// =====================================================================
// [SECTION] :: COMPOSABLES
// =====================================================================

import { useDataStore } from '~/composables/stores/useDataStore'

/** Intercambio dinámico del título de la pestaña. */
useTitleSwap()

// =====================================================================
// [SECTION] :: INITIAL LOADING STATE
// =====================================================================

/**
 * [STATE] :: IS_LOADING
 * Controla la visibilidad del overlay de carga inicial.
 * Se oculta una vez que la app está completamente montada e hidratada.
 */
const isLoading = ref(true)

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

const isAppMounted = useState('is-app-mounted', () => false)
const dataStore = useDataStore()

onMounted(() => {
  // Start data auto-refresh (1 hour)
  dataStore.startAutoRefresh()

  // Hide loading overlay after mount (hydration complete)
  // Small delay to ensure fonts are loaded
  setTimeout(() => {
    isLoading.value = false
    isAppMounted.value = true
  }, 100)
})

onUnmounted(() => {
  dataStore.stopAutoRefresh()
})
</script>

<template>
  <div>
    <!-- Initial Loading Overlay ( styled with inline CSS for maximum compatibility when changing styles) -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isLoading" 
        class="fixed inset-0 z-9999 flex items-center justify-center bg-light"
        style="position: fixed; inset: 0; z-index: 9999; background-color: #f8f8f8; display: flex; align-items: center; justify-content: center;"
      >
        <UiLoadingSpinner size="lg" color="dark" />
      </div>
    </Transition>
    
    <NuxtPage />
  </div>
</template>