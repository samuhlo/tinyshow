<script setup lang="ts">
/**
 * [LAYOUT] :: DEFAULT
 * ----------------------------------------------------------------------
 * Layout base de la aplicación.
 * Proporciona el contenedor principal con Header y Footer.
 *
 * @module    layouts/default
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import Header from "~/components/layout/Header.vue";
import Footer from "~/components/layout/Footer.vue";
</script>

<template>
  <div class="max-w-screen-2xl mx-auto min-h-screen bg-light text-dark font-mono relative flex flex-col">
    <Header />

    <main class="w-full flex-1 pt-24 md:pt-32 px-6 md:px-10">
      <slot />
    </main>

    <Footer />
  </div>
</template>

