<script setup lang="ts">
/**
 * [LAYOUT] :: HEADER
 * ----------------------------------------------------------------------
 * Header fijo de la aplicación.
 * Contiene el logo y el selector de idioma.
 *
 * @module    components/layout/Header
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import AppLogo from "~/components/ui/AppLogo.vue";
import LangSwitcher from "~/components/ui/LangSwitcher.vue";
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 w-full max-w-screen-2xl mx-auto z-50 flex items-center justify-between p-6 md:p-10"
  >
    <AppLogo />
    <LangSwitcher />
  </header>
</template>
