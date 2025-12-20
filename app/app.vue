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
// [SECTION] :: INITIAL LOADING STATE
// =====================================================================

/**
 * [STATE] :: IS_LOADING
 * Controla la visibilidad del overlay de carga inicial.
 * Se oculta una vez que la app está completamente montada e hidratada.
 */
const isLoading = ref(true)

// =====================================================================
// [SECTION] :: TAB TITLE SWAP
// =====================================================================

let originalTitle = 'TinyShow'

const handleBlur = () => {
  originalTitle = document.title
  document.title = 'Show must go ON !!!'
}

const handleFocus = () => {
  if (originalTitle) {
    document.title = originalTitle
  }
}

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

onMounted(() => {
  // Tab title swap listeners
  window.addEventListener('blur', handleBlur)
  window.addEventListener('focus', handleFocus)
  
  // Hide loading overlay after mount (hydration complete)
  // Small delay to ensure fonts are loaded
  setTimeout(() => {
    isLoading.value = false
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('blur', handleBlur)
  window.removeEventListener('focus', handleFocus)
})
</script>

<template>
  <div>
    <!-- Initial Loading Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isLoading" 
        class="fixed inset-0 z-9999 flex items-center justify-center bg-light"
      >
        <UiLoadingSpinner size="lg" color="dark" />
      </div>
    </Transition>
    
    <NuxtPage />
  </div>
</template>