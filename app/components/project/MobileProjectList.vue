<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_LIST
 * ----------------------------------------------------------------------
 * Lista de proyectos para móvil con navegación tipo "slot machine".
 * Usa ProjectRow para items colapsados y ProjectDetail para el activo.
 * Máximo 2 ProjectRows arriba + 1 ProjectDetail + 2 ProjectRows abajo.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import MobileProjectRow from "./MobileProjectRow.vue";
import MobileProjectDetail from "./MobileProjectDetail.vue";
import type { Project } from "~~/shared/types";

// =====================================================================
// [SECTION] :: ANIMATION CONSTANTS
// =====================================================================

const SWIPE_THRESHOLD = 50;
const ANIM_DURATION = 0.6;
const ANIM_EASE = "power3.out";
const MAX_VISIBLE_ROWS = 1; // Only show 1 row above/below the detail

// =====================================================================
// [SECTION] :: COMPONENT STATE
// =====================================================================

const showcaseStore = useShowcaseStore();

// Active project index
const activeIndex = ref(0);

// Touch tracking
const touchStartY = ref(0);
const isTransitioning = ref(false);

// Container ref
const containerRef = ref<HTMLElement | null>(null);
const detailRef = ref<HTMLElement | null>(null);

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

/**
 * [COMPUTED] :: PROJECTS
 * Gets filtered projects from store.
 */
const projects = computed(() => showcaseStore.projects);

/**
 * [COMPUTED] :: ACTIVE_PROJECT
 * The currently expanded project.
 */
const activeProject = computed(() => projects.value[activeIndex.value] || null);

/**
 * [COMPUTED] :: PROJECTS_ABOVE
 * ProjectRows to show above the detail (max 2).
 */
const projectsAbove = computed(() => {
  const startIdx = Math.max(0, activeIndex.value - MAX_VISIBLE_ROWS);
  const endIdx = activeIndex.value;
  return projects.value.slice(startIdx, endIdx).map((p, i) => ({
    project: p,
    originalIndex: startIdx + i,
  }));
});

/**
 * [COMPUTED] :: PROJECTS_BELOW
 * ProjectRows to show below the detail (max 1).
 */
const projectsBelow = computed(() => {
  const startIdx = activeIndex.value + 1;
  const endIdx = Math.min(projects.value.length, activeIndex.value + MAX_VISIBLE_ROWS + 1);
  return projects.value.slice(startIdx, endIdx).map((p, i) => ({
    project: p,
    originalIndex: startIdx + i,
  }));
});

/**
 * [COMPUTED] :: VISIBLE_ROW_ABOVE
 * The single row to show above the detail (if any).
 */
const visibleRowAbove = computed(() => {
  if (projectsAbove.value.length === 0) return null;
  return projectsAbove.value[projectsAbove.value.length - 1];
});

/**
 * [COMPUTED] :: VISIBLE_ROW_BELOW
 * The single row to show below the detail (if any).
 */
const visibleRowBelow = computed(() => {
  if (projectsBelow.value.length === 0) return null;
  return projectsBelow.value[0];
});

/**
 * [COMPUTED] :: CAN_GO_PREVIOUS
 */
const canGoPrevious = computed(() => activeIndex.value > 0);

/**
 * [COMPUTED] :: CAN_GO_NEXT
 */
const canGoNext = computed(() => activeIndex.value < projects.value.length - 1);

// =====================================================================
// [SECTION] :: NAVIGATION LOGIC
// =====================================================================

/**
 * [ACTION] :: GO_TO_PROJECT
 * Navigate to a specific project index (instant, no animation).
 */
const goToProject = (targetIndex: number) => {
  if (isTransitioning.value) return;
  if (targetIndex < 0 || targetIndex >= projects.value.length) return;
  if (targetIndex === activeIndex.value) return;

  // Simply change the index - no animation needed
  activeIndex.value = targetIndex;
};

/**
 * [ACTION] :: GO_TO_PREVIOUS
 */
const goToPrevious = () => {
  if (canGoPrevious.value) {
    goToProject(activeIndex.value - 1);
  }
};

/**
 * [ACTION] :: GO_TO_NEXT
 */
const goToNext = () => {
  if (canGoNext.value) {
    goToProject(activeIndex.value + 1);
  }
};

/**
 * [HANDLE] :: ROW_CLICK
 * When a ProjectRow is clicked, navigate to that project.
 */
const handleRowClick = (project: Project, originalIndex: number) => {
  goToProject(originalIndex);
};

/**
 * [HANDLE] :: CLOSE_DETAIL
 * No-op for mobile - we always show one project open.
 */
const handleCloseDetail = () => {
  // In mobile, we don't close - just ignore
};

// =====================================================================
// [SECTION] :: TOUCH GESTURE DETECTION
// =====================================================================

/**
 * [HANDLE] :: TOUCH_START
 */
const handleTouchStart = (e: TouchEvent) => {
  if (isTransitioning.value) return;
  const firstTouch = e.touches[0];
  if (firstTouch) {
    touchStartY.value = firstTouch.clientY;
  }
};

/**
 * [HANDLE] :: TOUCH_END
 */
const handleTouchEnd = (e: TouchEvent) => {
  if (isTransitioning.value) return;
  
  const endTouch = e.changedTouches[0];
  if (!endTouch) return;

  const deltaY = endTouch.clientY - touchStartY.value;

  if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

  // Swipe DOWN (positive) -> go PREVIOUS (scroll up to see earlier projects)
  if (deltaY > 0) {
    goToPrevious();
  }
  // Swipe UP (negative) -> go NEXT (scroll down to see later projects)
  else {
    goToNext();
  }
};

// =====================================================================
// [SECTION] :: WATCHERS & LIFECYCLE
// =====================================================================

/**
 * [WATCH] :: ACTIVE_TECH
 * Reset to first project when tech changes.
 */
watch(
  () => showcaseStore.activeTech,
  () => {
    activeIndex.value = 0;
    isTransitioning.value = false;
  }
);

/**
 * [LIFECYCLE] :: LOCK_BODY_SCROLL
 * Prevents body and html from scrolling when mobile project list is active.
 */
onMounted(() => {
  if (import.meta.client) {
    // Lock both html and body
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = '0';
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    // Restore both html and body
    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    document.documentElement.style.width = '';
    document.documentElement.style.height = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.top = '';
  }
});
</script>

<template>
  <div 
    ref="containerRef"
    class="mobile-project-list fixed inset-x-0 top-12 bottom-28 overflow-hidden bg-light touch-none"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchmove.prevent
  >
    <!-- Loading State -->
    <div v-if="showcaseStore.isProjectsLoading" class="h-full flex items-center justify-center">
      <UiLoadingSpinner size="md" color="dark" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!projects || projects.length === 0" class="h-full flex items-center justify-center px-4">
      <p class="text-mono-sm text-gray-400">
        // NO_PROJECTS_FOUND_FOR :: {{ showcaseStore.activeTech }}
      </p>
    </div>

    <!-- Projects Layout - Flex Positioned Zones -->
    <div v-else class="h-full flex flex-col">
      
      <!-- ZONE: Top - Row Above (shrink-0, natural height) -->
      <div class="shrink-0 bg-light">
        <MobileProjectRow
          v-if="visibleRowAbove"
          :project="visibleRowAbove.project"
          :index="visibleRowAbove.originalIndex"
          position="above"
          @expand="() => handleRowClick(visibleRowAbove!.project, visibleRowAbove!.originalIndex)"
        />
      </div>

      <!-- ZONE: Center - Detail (flex-1, fills remaining space) -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <div ref="detailRef" class="w-full h-full">
          <MobileProjectDetail
            v-if="activeProject"
            :key="activeProject.id"
            :project="activeProject"
          />
        </div>
      </div>

      <!-- ZONE: Bottom - Row Below (shrink-0, natural height) -->
      <div class="shrink-0 bg-light">
        <MobileProjectRow
          v-if="visibleRowBelow"
          :project="visibleRowBelow.project"
          :index="visibleRowBelow.originalIndex"
          position="below"
          @expand="() => handleRowClick(visibleRowBelow!.project, visibleRowBelow!.originalIndex)"
        />
      </div>
      
    </div>
  </div>
</template>

<style scoped>
/* No animations needed - instant transitions look cleaner */
</style>

