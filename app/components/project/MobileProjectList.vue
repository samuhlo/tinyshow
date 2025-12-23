<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_LIST
 * ----------------------------------------------------------------------
 * Lista de proyectos optimizada para móvil con navegación vertical tipo swipe.
 * Implementa vista virtual (máximo 5 items visibles: 2+1+2) y gestos touch.
 * El proyecto activo está siempre centrado con los otros colapsados arriba/abajo.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import MobileProjectCard from "./MobileProjectCard.vue";

// =====================================================================
// [SECTION] :: ANIMATION CONSTANTS
// =====================================================================

const SWIPE_THRESHOLD = 50; // Minimum px to register as swipe
const SCROLL_DURATION = 0.6;
const SCROLL_EASE = "power3.out";

// =====================================================================
// [SECTION] :: COMPONENT STATE
// =====================================================================

const showcaseStore = useShowcaseStore();

// Active project index (local state)
const activeIndex = ref(0);

// Touch tracking
const touchStartY = ref(0);
const isTransitioning = ref(false);

// Container ref for scroll
const containerRef = ref<HTMLElement | null>(null);

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

/**
 * [COMPUTED] :: PROJECTS
 * Obtiene los proyectos filtrados del store.
 */
const projects = computed(() => showcaseStore.projects);

/**
 * [COMPUTED] :: VISIBLE_PROJECTS
 * Retorna solo los 5 proyectos alrededor del índice activo.
 * Estructura: [idx-2, idx-1, idx (active), idx+1, idx+2]
 */
const visibleProjects = computed(() => {
  const startIndex = Math.max(0, activeIndex.value - 2);
  const endIndex = Math.min(projects.value.length, activeIndex.value + 3);
  return projects.value.slice(startIndex, endIndex);
});

/**
 * [COMPUTED] :: CAN_GO_PREVIOUS
 * Verifica si hay proyectos anteriores disponibles.
 */
const canGoPrevious = computed(() => activeIndex.value > 0);

/**
 * [COMPUTED] :: CAN_GO_NEXT
 * Verifica si hay proyectos siguientes disponibles.
 */
const canGoNext = computed(() => activeIndex.value < projects.value.length - 1);

// =====================================================================
// [SECTION] :: NAVIGATION LOGIC
// =====================================================================

/**
 * [ACTION] :: GO_TO_PREVIOUS
 * Navega al proyecto anterior.
 */
const goToPrevious = () => {
  if (!canGoPrevious.value || isTransitioning.value) return;
  
  isTransitioning.value = true;
  activeIndex.value--;
  
  nextTick(() => {
    scrollToActive();
  });
};

/**
 * [ACTION] :: GO_TO_NEXT
 * Navega al proyecto siguiente.
 */
const goToNext = () => {
  if (!canGoNext.value || isTransitioning.value) return;
  
  isTransitioning.value = true;
  activeIndex.value++;
  
  nextTick(() => {
    scrollToActive();
  });
};

/**
 * [ANIM] :: SCROLL_TO_ACTIVE
 * Anima el scroll hacia el proyecto activo (centrado).
 */
const scrollToActive = () => {
  if (!containerRef.value) {
    isTransitioning.value = false;
    return;
  }

  // Find the active card element
  const activeCard = containerRef.value.querySelector('.mobile-project-card:nth-child(3)') as HTMLElement;
  
  if (!activeCard) {
    isTransitioning.value = false;
    return;
  }

  // Calculate scroll position to center the active card
  const containerRect = containerRef.value.getBoundingClientRect();
  const cardRect = activeCard.getBoundingClientRect();
  const containerCenter = containerRect.height / 2;
  const cardCenter = cardRect.height / 2;
  const scrollOffset = cardRect.top - containerRect.top - containerCenter + cardCenter;

  gsap.to(containerRef.value, {
    scrollTop: containerRef.value.scrollTop + scrollOffset,
    duration: SCROLL_DURATION,
    ease: SCROLL_EASE,
    onComplete: () => {
      isTransitioning.value = false;
    },
  });
};

// =====================================================================
// [SECTION] :: TOUCH GESTURE DETECTION
// =====================================================================

/**
 * [HANDLE] :: TOUCH_START
 * Captura la posición inicial del touch.
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
 * Calcula el delta y determina la dirección del swipe.
 */
const handleTouchEnd = (e: TouchEvent) => {
  if (isTransitioning.value) return;
  
  const endTouch = e.changedTouches[0];
  if (!endTouch) return;

  const touchEndY = endTouch.clientY;
  const deltaY = touchEndY - touchStartY.value;

  // Check if swipe meets threshold
  if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

  // Swipe DOWN (positive deltaY) -> go to PREVIOUS
  if (deltaY > 0) {
    goToPrevious();
  }
  // Swipe UP (negative deltaY) -> go to NEXT
  else {
    goToNext();
  }
};

// =====================================================================
// [SECTION] :: WATCHERS & LIFECYCLE
// =====================================================================

/**
 * [WATCH] :: ACTIVE_TECH
 * Reset to first project when tech selection changes.
 */
watch(
  () => showcaseStore.activeTech,
  () => {
    activeIndex.value = 0;
    isTransitioning.value = false;
    
    // Scroll to top on tech change
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
    }
  }
);

/**
 * [MOUNTED] :: INITIAL_SCROLL
 * Center the first project on mount.
 */
onMounted(() => {
  if (projects.value.length > 0) {
    nextTick(() => {
      scrollToActive();
    });
  }
});
</script>

<template>
  <div 
    class="mobile-project-list w-full h-[calc(100vh-200px)] relative"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <!-- Header -->
    <header class="mb-8 px-4">
      <h2 
        class="font-sans font-black uppercase tracking-tighter text-dark text-4xl mb-3"
        v-if="showcaseStore.activeTech"
      >
        {{ showcaseStore.activeTech }}
      </h2>
      <div class="h-px bg-dark w-full"></div>
    </header>

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
    <div
      v-else
      ref="containerRef"
      class="projects-container h-full overflow-y-auto px-4 pb-32"
      style="scroll-behavior: smooth;"
    >
      <MobileProjectCard
        v-for="(project, index) in visibleProjects"
        :key="project.id"
        :project="project"
        :is-active="index === 2"
        :position="index - 2"
      />
    </div>

    <!-- Swipe Indicators (Optional visual feedback) -->
    <div class="absolute bottom-8 left-0 right-0 flex justify-center gap-2 pointer-events-none">
      <div 
        v-if="canGoPrevious"
        class="w-2 h-2 rounded-full bg-dark/30"
      ></div>
      <div class="w-2 h-2 rounded-full bg-accent"></div>
      <div 
        v-if="canGoNext"
        class="w-2 h-2 rounded-full bg-dark/30"
      ></div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.projects-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.projects-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
