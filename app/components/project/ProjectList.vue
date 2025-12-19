<script setup lang="ts">
/**
 * [COMPONENT] :: PROJECT_LIST
 * ----------------------------------------------------------------------
 * Listado reactivo de proyectos filtrados por tecnología.
 * Gestiona la carga de datos y la orquestación de animaciones GSAP.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import ProjectRow from "./ProjectRow.vue";

const ANIM_DURATION_WAVE = 0.8;
const ANIM_STAGGER_WAVE = 0.1;
const ANIM_INITIAL_Y_OFFSET = 50;
const ANIM_DELAY = 0;
const ANIM_EASE_OUT = "power3.out";

const FLIP_SYNC_DELAY = 0.3;
const PROJECT_LIMIT = 50;
const LOADING_TEXT = "LOADING_DATA...";



// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  tech: string | null;
}

const props = defineProps<Props>();

// =====================================================================
// [SECTION] :: DATA FETCHING
// =====================================================================

// Fetch projects based on active tech
const { data: projects, pending, refresh } = await useFetch("/api/projects", {
  query: computed(() => ({
    primary_tech: props.tech,
    limit: PROJECT_LIMIT,
  })),
  watch: [() => props.tech],
});

// =====================================================================
// [SECTION] :: ANIMATION LOGIC
// =====================================================================

const listRef = ref<HTMLElement | null>(null);

/**
 * [ANIM] :: ANIMATE_ENTRANCE
 * Dispara la animación de entrada (fade + slide up) para los items.
 *
 * @param delay - (Optional) Retraso inicial para sincronizar con otras animaciones.
 */
const animateEntrance = (delay: number = 0) => {
  if (!listRef.value) return;
  
  // Select all rows within the list
  const rows = listRef.value.querySelectorAll(".project-row-wrapper");
  
  if (rows.length === 0) return;

  gsap.fromTo(
    rows,
    {
      y: ANIM_INITIAL_Y_OFFSET,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: ANIM_DURATION_WAVE,
      stagger: ANIM_STAGGER_WAVE,
      delay: delay,
      ease: ANIM_EASE_OUT,
    }
  );
};

// =====================================================================
// [SECTION] :: WATCHERS & LIFECYCLE
// =====================================================================

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
    animateEntrance(FLIP_SYNC_DELAY);
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
    <div v-if="pending" class="py-12 flex justify-center">
      <UiLoadingSpinner size="md" color="dark" />
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
