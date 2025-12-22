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
import { useShowcaseStore } from "~/composables/stores/useShowcaseStore";

const showcaseStore = useShowcaseStore();
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 w-full max-w-screen-2xl mx-auto z-50 flex items-center justify-between p-6 md:p-10"
  >
    <!-- Logo wrapper: Instant appear when intro ends (no transition) to match the landing position of MobileIntro -->
    <div :class="{ 'opacity-0': showcaseStore.isIntroAnimating, 'opacity-100': !showcaseStore.isIntroAnimating }">
      <AppLogo id="header-logo" />
    </div>
    
    <!-- Lang Switcher: Smooth fade in -->
    <LangSwitcher 
      :class="{ 'opacity-0': showcaseStore.isIntroAnimating, 'opacity-100 transition-opacity duration-700 delay-200': !showcaseStore.isIntroAnimating }"
    />
  </header>
</template>
