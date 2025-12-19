<script setup lang="ts">
/**
 * [APP] :: ROOT_ENTRY
 * ----------------------------------------------------------------------
 * Componente raíz de la aplicación Nuxt.
 * Actúa únicamente como contenedor para el sistema de páginas y notificaciones.
 *
 * @module    app
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

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

onMounted(() => {
  window.addEventListener('blur', handleBlur)
  window.addEventListener('focus', handleFocus)
})

onUnmounted(() => {
  window.removeEventListener('blur', handleBlur)
  window.removeEventListener('focus', handleFocus)
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>