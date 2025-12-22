<script setup lang="ts">
/**
 * [LAYOUT] :: DEFAULT
 * ----------------------------------------------------------------------
 * Layout base de la aplicación.
 * Actúa como un switch inteligente entre DesktopLayout y MobileLayout
 * basado en el estado global de UI.
 *
 * @module    layouts/default
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import DesktopLayout from "~/components/layout/DesktopLayout.vue";
import MobileLayout from "~/components/layout/MobileLayout.vue";
import { useUiStore } from "~/stores/useUiStore";

const uiStore = useUiStore();
</script>

<template>
  <div>
    <DesktopLayout v-if="!uiStore.isMobile">
      <slot />
    </DesktopLayout>
    
    <MobileLayout v-else>
      <slot />
    </MobileLayout>
  </div>
</template>

