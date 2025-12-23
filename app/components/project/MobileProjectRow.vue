<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_ROW
 * ----------------------------------------------------------------------
 * Versión compacta del ProjectRow para móvil.
 * Sin efectos hover complejos, diseño minimalista.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import type { Project } from "~~/shared/types";

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  project: Project;
  index: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  expand: [project: Project];
}>();

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

const formattedIndex = computed(() => {
  return (props.index + 1).toString().padStart(2, "0");
});

// =====================================================================
// [SECTION] :: HANDLERS
// =====================================================================

const handleClick = () => {
  emit("expand", props.project);
};
</script>

<template>
  <article
    class="mobile-project-row flex items-center justify-between py-3 px-4 border-b border-dark/10 cursor-pointer active:bg-dark/5"
    @click="handleClick"
  >
    <!-- Content (index + title) -->
    <div class="flex items-center gap-6">
      <!-- Index -->
      <span class="text-mono-xs text-dark/50">
        {{ formattedIndex }}
      </span>

      <!-- Title -->
      <h3 class="text-base font-sans text-dark">
        {{ project.title }}
      </h3>
    </div>

    <!-- Arrow icon -->
    <div>
      <Icon name="material-symbols:arrow-forward" class="text-lg text-dark/40" />
    </div>
  </article>
</template>
