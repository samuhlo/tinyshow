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
const MAX_VISIBLE_ROWS = 2; // Max rows above/below the detail

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
 * ProjectRows to show below the detail (max 2).
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
 * Navigate to a specific project index with slot machine animation.
 */
const goToProject = async (targetIndex: number) => {
  if (isTransitioning.value) return;
  if (targetIndex < 0 || targetIndex >= projects.value.length) return;
  if (targetIndex === activeIndex.value) return;

  isTransitioning.value = true;

  const direction = targetIndex > activeIndex.value ? 'down' : 'up';
  
  // Animate the transition
  if (containerRef.value && detailRef.value) {
    const tl = gsap.timeline({
      onComplete: () => {
        activeIndex.value = targetIndex;
        isTransitioning.value = false;
      },
    });

    // Slide detail out
    tl.to(detailRef.value, {
      y: direction === 'down' ? -100 : 100,
      opacity: 0,
      duration: ANIM_DURATION * 0.5,
      ease: ANIM_EASE,
    });

    // Update index and slide new detail in
    tl.add(() => {
      activeIndex.value = targetIndex;
    });

    tl.fromTo(
      detailRef.value,
      { y: direction === 'down' ? 100 : -100, opacity: 0 },
      { y: 0, opacity: 1, duration: ANIM_DURATION * 0.5, ease: ANIM_EASE }
    );
  } else {
    activeIndex.value = targetIndex;
    isTransitioning.value = false;
  }
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
</script>

<template>
  <div 
    ref="containerRef"
    class="mobile-project-list fixed inset-x-0 top-16 bottom-28 overflow-y-auto overflow-x-hidden"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >

    <!-- Loading State -->
    <div v-if="showcaseStore.isProjectsLoading" class="flex justify-center py-12">
      <UiLoadingSpinner size="md" color="dark" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!projects || projects.length === 0" class="py-12 px-4">
      <p class="text-mono-sm text-gray-400">
        // NO_PROJECTS_FOUND_FOR :: {{ showcaseStore.activeTech }}
      </p>
    </div>

    <!-- Projects Container -->
    <div v-else class="flex flex-col">
      <!-- Navigation Arrow Up -->
      <div 
        v-if="canGoPrevious" 
        class="flex justify-center py-2 cursor-pointer"
        @click="goToPrevious"
      >
        <Icon name="material-symbols:keyboard-arrow-up" class="text-3xl text-dark/50" />
      </div>

      <!-- ProjectRows ABOVE (collapsed) -->
      <div>
        <MobileProjectRow
          v-for="item in projectsAbove"
          :key="item.project.id"
          :project="item.project"
          :index="item.originalIndex"
          @expand="() => handleRowClick(item.project, item.originalIndex)"
        />
      </div>

      <!-- ProjectDetail (active/expanded) -->
      <div ref="detailRef" class="my-2">
        <MobileProjectDetail
          v-if="activeProject"
          :project="activeProject"
        />
      </div>

      <!-- ProjectRows BELOW (collapsed) -->
      <div>
        <MobileProjectRow
          v-for="item in projectsBelow"
          :key="item.project.id"
          :project="item.project"
          :index="item.originalIndex"
          @expand="() => handleRowClick(item.project, item.originalIndex)"
        />
      </div>

      <!-- Navigation Arrow Down -->
      <div 
        v-if="canGoNext" 
        class="flex justify-center py-2 cursor-pointer"
        @click="goToNext"
      >
        <Icon name="material-symbols:keyboard-arrow-down" class="text-3xl text-dark/50" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-row-mobile {
  cursor: pointer;
}
</style>
