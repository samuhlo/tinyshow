<script setup lang="ts">
/**
 * [COMPONENT] :: ProjectRow
 * ----------------------------------------------------------------------
 * Represents a single project in the list.
 * Follows the "Structural & Raw" design philosophy.
 *
 * Layout: Index (01) | Title | Arrow (->)
 *
 * @param {Object} project - Project data
 * @param {Number} index - Display index (0-based)
 */

interface Project {
  id: string;
  title: string;
  // Add other properties as needed from your Prisma model
}

interface Props {
  project: Project;
  index: number;
}

const props = defineProps<Props>();

// Format index to always be 2 digits (01, 02, etc.)
const formattedIndex = computed(() => {
  return (props.index + 1).toString().padStart(2, "0");
});
</script>

<template>
  <article
    class="project-row group relative flex items-center justify-between py-6 border-b border-dark/10 cursor-pointer overflow-hidden"
  >
    <!-- Background hover effect -->
    <div
      class="absolute inset-0 bg-dark transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-expo-out -z-10"
    ></div>

    <div class="flex items-center gap-12 pl-2">
      <!-- Index -->
      <span
        class="text-mono-sm text-gray-500 group-hover:text-accent transition-colors duration-300"
      >
        {{ formattedIndex }}
      </span>

      <!-- Title -->
      <h3
        class="text-2xl font-sans text-dark group-hover:text-light transition-colors duration-300"
      >
        {{ project.title }}
      </h3>
    </div>

    <!-- Arrow icon -->
    <div class="pr-4 overflow-hidden">
      <span
        class="inline-block text-dark group-hover:text-accent group-hover:translate-x-2 transition-all duration-300 text-2xl"
      >
        <Icon name="material-symbols:arrow-forward" />
      </span>
    </div>
  </article>
</template>

<style scoped>
/* Custom easing usually defined in global css or tailwind config, 
   but using standard cubic-bezier for 'expo-out' approximation if not available */
.ease-expo-out {
  transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}
</style>
