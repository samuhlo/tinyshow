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
const MAX_VISIBLE_ROWS = 1; // Mostrar solo 1 fila arriba/abajo del detalle

// =====================================================================
// [SECTION] :: COMPONENT STATE
// =====================================================================

const showcaseStore = useShowcaseStore();

// Índice del proyecto activo
const activeIndex = ref(0);

// Rastreo táctil
const touchStartY = ref(0);
const isTransitioning = ref(false);

// Referencia del contenedor
const containerRef = ref<HTMLElement | null>(null);
const detailRef = ref<HTMLElement | null>(null);

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

/**
 * [COMPUTED] :: PROJECTS
 * Obtiene proyectos filtrados desde el store.
 */
const projects = computed(() => showcaseStore.projects);

/**
 * [COMPUTED] :: ACTIVE_PROJECT
 * El proyecto expandido actualmente.
 */
const activeProject = computed(() => projects.value[activeIndex.value] || null);

/**
 * [COMPUTED] :: PROJECTS_ABOVE
 * Filas de proyecto a mostrar encima del detalle (max 2).
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
 * Filas de proyecto a mostrar debajo del detalle (max 1).
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
 * La única fila visible encima del detalle (si hay).
 */
const visibleRowAbove = computed(() => {
  if (projectsAbove.value.length === 0) return null;
  return projectsAbove.value[projectsAbove.value.length - 1];
});

/**
 * [COMPUTED] :: VISIBLE_ROW_BELOW
 * La única fila visible debajo del detalle (si hay).
 */
const visibleRowBelow = computed(() => {
  if (projectsBelow.value.length === 0) return null;
  return projectsBelow.value[0];
});

/**
 * [COMPUTED] :: CAN_GO_PREVIOUS
 * Indica si es posible navegar al anterior.
 */
const canGoPrevious = computed(() => activeIndex.value > 0);

/**
 * [COMPUTED] :: CAN_GO_NEXT
 * Indica si es posible navegar al siguiente.
 */
const canGoNext = computed(() => activeIndex.value < projects.value.length - 1);

// =====================================================================
// [SECTION] :: NAVIGATION LOGIC
// =====================================================================

/**
 * [ACTION] :: GO_TO_PROJECT
 * Navega a un índice de proyecto específico (instantáneo, sin animación).
 */
const goToProject = (targetIndex: number) => {
  if (isTransitioning.value) return;
  if (targetIndex < 0 || targetIndex >= projects.value.length) return;
  if (targetIndex === activeIndex.value) return;

  // Simplemente cambiar el índice - no se necesita animación
  activeIndex.value = targetIndex;
};

/**
 * [ACTION] :: GO_TO_PREVIOUS
 * Navega al proyecto anterior si existe.
 */
const goToPrevious = () => {
  if (canGoPrevious.value) {
    goToProject(activeIndex.value - 1);
  }
};

/**
 * [ACTION] :: GO_TO_NEXT
 * Navega al proyecto siguiente si existe.
 */
const goToNext = () => {
  if (canGoNext.value) {
    goToProject(activeIndex.value + 1);
  }
};

/**
 * [HANDLE] :: ROW_CLICK
 * Navega al proyecto cuando se hace click en una fila.
 */
const handleRowClick = (project: Project, originalIndex: number) => {
  goToProject(originalIndex);
};

/**
 * [HANDLE] :: CLOSE_DETAIL
 * No hace nada en móvil - siempre mostramos un proyecto abierto.
 */
const handleCloseDetail = () => {
  // En móvil no cerramos - simplemente ignorar
};

// =====================================================================
// [SECTION] :: TOUCH GESTURE DETECTION
// =====================================================================

/**
 * [HANDLE] :: TOUCH_START
 * Inicia el rastreo del gesto táctil.
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
 * Finaliza el gesto y determina si hubo swipe.
 */
const handleTouchEnd = (e: TouchEvent) => {
  if (isTransitioning.value) return;
  
  const endTouch = e.changedTouches[0];
  if (!endTouch) return;

  const deltaY = endTouch.clientY - touchStartY.value;

  if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

  // Swipe ABAJO (positivo) -> ir al ANTERIOR (scroll arriba para ver proyectos anteriores)
  if (deltaY > 0) {
    goToPrevious();
  }
  // Swipe ARRIBA (negativo) -> ir al SIGUIENTE (scroll abajo para ver proyectos posteriores)
  else {
    goToNext();
  }
};

// =====================================================================
// [SECTION] :: WATCHERS & LIFECYCLE
// =====================================================================

/**
 * [WATCH] :: ACTIVE_TECH
 * Reinicia al primer proyecto cuando cambia la tecnología.
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
 * Previene el scroll del body y html cuando la lista móvil está activa.
 */
onMounted(() => {
  if (import.meta.client) {
    // Bloquear tanto html como body
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
    // Restaurar tanto html como body
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
    <!-- Estado de Carga -->
    <div v-if="showcaseStore.isProjectsLoading" class="h-full flex items-center justify-center">
      <UiLoadingSpinner size="md" color="dark" />
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="!projects || projects.length === 0" class="h-full flex items-center justify-center px-4">
      <p class="text-mono-sm text-gray-400">
        // NO_PROJECTS_FOUND_FOR :: {{ showcaseStore.activeTech }}
      </p>
    </div>

    <!-- Layout de Proyectos - Zonas Posicionadas con Flex -->
    <div v-else class="h-full flex flex-col">
      
      <!-- ZONA: Arriba - Fila Superior (shrink-0, altura natural) -->
      <div class="shrink-0 bg-light">
        <MobileProjectRow
          v-if="visibleRowAbove"
          :project="visibleRowAbove.project"
          :index="visibleRowAbove.originalIndex"
          position="above"
          @expand="() => handleRowClick(visibleRowAbove!.project, visibleRowAbove!.originalIndex)"
        />
      </div>

      <!-- ZONA: Centro - Detalle (flex-1, llena espacio restante) -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <div ref="detailRef" class="w-full h-full">
          <MobileProjectDetail
            v-if="activeProject"
            :key="activeProject.id"
            :project="activeProject"
          />
        </div>
      </div>

      <!-- ZONA: Abajo - Fila Inferior (shrink-0, altura natural) -->
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
/* No se necesitan animaciones - transiciones instantáneas se ven más limpias */
</style>

