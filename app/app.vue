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

/** Intercambio dinámico del título de la pestaña. */
useTitleSwap()

const uiStore = useUiStore()

onMounted(() => {
  uiStore.checkDevice()
})

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

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

onMounted(() => {
  // Ocultar overlay de carga tras montar (hidratación completa)
  // Pequeño retraso para asegurar carga de fuentes
  setTimeout(() => {
    isLoading.value = false
    uiStore.setAppMounted(true)
  }, 100)
})
</script>

<template>
  <div>
    <!-- Overlay de Carga Inicial -->
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