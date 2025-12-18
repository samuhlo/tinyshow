<script setup lang="ts">
interface Props {
  technologies: string[];
  activeTech: string | null;
  viewMode: "hero" | "sidebar";
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "select", tech: string): void;
}>();
</script>

<template>
  <nav
    class="flex flex-col transition-all duration-500 ease-in-out"
    :class="[
      viewMode === 'hero'
        ? 'items-center justify-center gap-6'
        : 'items-start justify-start gap-4 mt-0',
    ]"
  >
    <button
      v-for="tech in technologies"
      :key="tech"
      @click="emit('select', tech)"
      class="transition-all duration-300 ease-out relative group flex items-center"
      :class="[
        viewMode === 'hero'
          ? 'font-display uppercase text-6xl md:text-8xl tracking-tighter text-dark hover:text-accent hover:scale-105'
          : 'font-sans text-2xl text-left',
        viewMode === 'sidebar' && activeTech === tech
          ? 'text-dark opacity-100'
          : viewMode === 'sidebar'
          ? 'text-gray-400 hover:text-dark'
          : '',
      ]"
    >
      <!-- Selection Indicator Block -->
      <span
        v-if="viewMode === 'sidebar'"
        class="block w-2 bg-accent mr-4 transition-all duration-300"
        :class="[
            activeTech === tech ? 'h-8 opacity-100' : 'h-0 opacity-0'
        ]"
      ></span>
      
      {{ tech }}
    </button>
  </nav>
</template>
