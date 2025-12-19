<script setup lang="ts">
import { gsap } from "gsap";

/**
 * [COMPONENT] :: ProjectList
 * ----------------------------------------------------------------------
 * Lists projects for the selected technology.
 * Fetches data from API and animates entrance using GSAP.
 *
 * @param {String} tech - Active technology to filter projects
 */

import ProjectRow from "./ProjectRow.vue";

interface Props {
  tech: string | null;
}

const props = defineProps<Props>();

// Fetch projects based on active tech
const { data: projects, pending, refresh } = await useFetch("/api/projects", {
  query: computed(() => ({
    primary_tech: props.tech,
    limit: 50,
  })),
  watch: [() => props.tech],
});

// Animation Refs
const listRef = ref<HTMLElement | null>(null);

/**
 * Animate the list items when projects change
 */
/**
 * Animate the list items when projects change
 */
const animateEntrance = (delay: number = 0) => {
  if (!listRef.value) return;
  
  // Select all rows within the list
  const rows = listRef.value.querySelectorAll(".project-row-wrapper");
  
  if (rows.length === 0) return;

  gsap.fromTo(
    rows,
    {
      y: 50,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      delay: delay,
      ease: "power3.out",
    }
  );
};

// Watch for data availability to trigger animation
watch(
  projects,
  async (newProjects) => {
    if (newProjects && newProjects.length > 0) {
      await nextTick();
      animateEntrance();
    }
  },
  { immediate: true }
);

// Re-trigger animation when tech changes (even if data is cached/fast)
watch(
  () => props.tech,
  async () => {
    // If we have data, animate it. If pending, the 'projects' watcher will handle it.
    if (!pending.value && projects.value?.length) {
      await nextTick();
      animateEntrance();
    }
  }
);
// Ensure animation runs on mount if data is already available
onMounted(async () => {
  if (projects.value && projects.value.length > 0) {
    // Wait for a tick to ensure DOM is ready
    await nextTick();
    // Add delay to sync with TechMenu FLIP animation (0.8s)
    animateEntrance(0.3);
  }
});
</script>

<template>
  <div ref="listRef" class="project-list w-full pt-32 pb-12">
    <!-- Header -->
    <header class="mb-12 overflow-hidden">
      <h2 
        class="font-sans font-black uppercase tracking-tighter text-dark mb-4 text-5xl md:text-7xl"
        v-if="tech"
      >
        {{ tech }}
      </h2>
      <div class="h-px bg-dark w-full"></div>
    </header>

    <!-- Loading State -->
    <div v-if="pending" class="py-12 text-center">
      <span class="text-mono-sm animate-pulse">LOADING_DATA...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!projects || projects.length === 0" class="py-12">
      <p class="text-mono-sm text-gray-400">
        // NO_PROJECTS_FOUND_FOR :: {{ tech }}
      </p>
    </div>

    <!-- List -->
    <div v-else class="flex flex-col">
      <div 
        v-for="(project, index) in projects" 
        :key="project.id"
        class="project-row-wrapper opacity-0" 
      >
        <ProjectRow 
          :project="project" 
          :index="index" 
        />
      </div>
    </div>
  </div>
</template>
