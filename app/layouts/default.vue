<script setup lang="ts">
import AppLogo from "~/components/ui/AppLogo.vue";
import LangSwitcher from "~/components/ui/LangSwitcher.vue";
</script>

<template>
  <div class="max-w-screen-2xl mx-auto min-h-screen bg-light text-dark font-mono relative">
    <!-- Header -->
    <header
      class="fixed top-0 left-0 right-0 w-full max-w-screen-2xl mx-auto z-50 flex items-center justify-between p-6 md:p-10"
    >
      <AppLogo />
      <LangSwitcher />
    </header>

    <!-- Main Content -->
    <main class="w-full  min-h-screen pt-32 px-6 md:px-10">
      <slot />
    </main>
  </div>
</template>
