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
import ProjectDetail from "./ProjectDetail.vue";

const ANIM_DURATION_WAVE = 0.8;
const ANIM_STAGGER_WAVE = 0.1;
const ANIM_INITIAL_Y_OFFSET = 50;
const ANIM_DELAY = 0;
const ANIM_EASE_OUT = "power3.out";

const FLIP_SYNC_DELAY = 0.3;
const LOADING_TEXT = "LOADING_DATA...";

const showcaseStore = useShowcaseStore();

// =====================================================================
// [SECTION] :: EXPANDED STATE
// =====================================================================

import type { Project } from "~~/shared/types";

const expandedProject = ref<Project | null>(null);
const expandedImageRect = ref<DOMRect | null>(null);

// Imagen fantasma para animación FLIP
const ghostImageUrl = ref<string | null>(null);
const ghostImageStyle = ref<Record<string, string>>({});
const ghostVisible = ref(false);
const detailImageRef = ref<HTMLElement | null>(null);

/**
 * [HANDLE] :: EXPAND_PROJECT
 * Maneja la expansión de un proyecto al hacer click en el row.
 * Inicia la animación FLIP del ghost image.
 */
const handleExpand = (project: Project, imageRect: DOMRect | null) => {
  // If same project, close it
  if (expandedProject.value?.id === project.id) {
    expandedProject.value = null;
    expandedImageRect.value = null;
    return;
  }
  
  // Configurar imagen fantasma para animación FLIP
  if (imageRect && project.img_url) {
    ghostImageUrl.value = project.img_url;
    ghostImageStyle.value = {
      position: 'fixed',
      left: `${imageRect.left}px`,
      top: `${imageRect.top}px`,
      width: `${imageRect.width}px`,
      height: `${imageRect.height}px`,
      zIndex: '9999',
      pointerEvents: 'none',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    };
    ghostVisible.value = true;
  }
  
  // Expandir nuevo proyecto
  expandedProject.value = project;
  expandedImageRect.value = imageRect;
};

/**
 * [ANIM] :: ANIMATE_GHOST_TO_DETAIL
 * Anima el ghost image hacia la posición del detail image.
 */
const animateGhostToDetail = async () => {
  await nextTick();
  
  // Encontrar el elemento de imagen de detalle
  const detailImage = document.querySelector('.project-detail-image');
  if (!detailImage || !ghostVisible.value) {
    ghostVisible.value = false;
    return;
  }
  
  const targetRect = detailImage.getBoundingClientRect();
  
  // Obtener el elemento fantasma
  const ghostEl = document.querySelector('.ghost-image');
  if (!ghostEl) {
    ghostVisible.value = false;
    return;
  }
  
  // Animar fantasma a la posición destino
  gsap.to(ghostEl, {
    left: targetRect.left,
    top: targetRect.top,
    width: targetRect.width,
    height: targetRect.height,
    duration: 0.5,
    ease: 'power3.out',
    onComplete: () => {
      ghostVisible.value = false;
      ghostImageUrl.value = null;
    },
  });
};

// Watch for expansion to trigger ghost animation
watch(expandedProject, (newVal) => {
  if (newVal && ghostVisible.value) {
    animateGhostToDetail();
  }
});

/**
 * [HANDLE] :: CLOSE_DETAIL
 * Maneja el cierre del detalle.
 */
const handleCloseDetail = () => {
  expandedProject.value = null;
  expandedImageRect.value = null;
  ghostVisible.value = false;
};

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
  
  // Seleccionar todas las filas dentro de la lista
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

// Observar proyectos del store para disparar animación
watch(
  () => showcaseStore.projects,
  async (newProjects) => {
    if (newProjects && newProjects.length > 0) {
      expandedProject.value = null; // Reiniciar expansión con nuevos datos
      await nextTick();
      animateEntrance();
    }
  },
  { deep: true }
);

// Observar cambios de tecnología para reiniciar estado interno
watch(
  () => showcaseStore.activeTech,
  () => {
    expandedProject.value = null;
    expandedImageRect.value = null;
  }
);

// Asegurar que la animación corra al montar si ya hay datos
onMounted(async () => {
  if (showcaseStore.projects.length > 0) {
    await nextTick();
    animateEntrance(FLIP_SYNC_DELAY);
  }
});
</script>

<template>
  <div ref="listRef" class="project-list w-full pt-60 pb-12"> 
    <!-- Cabecera -->
    <header class="mb-12 overflow-hidden">
      <h2 
        class="font-sans font-black uppercase tracking-tighter text-dark mb-4 text-5xl md:text-7xl"
        v-if="showcaseStore.activeTech"
      >
        {{ showcaseStore.activeTech }}
      </h2>
      <div class="h-px bg-dark w-full"></div>
    </header>

    <!-- Estado de Carga -->
    <div v-if="showcaseStore.isProjectsLoading" class="py-12 flex justify-center">
      <UiLoadingSpinner size="md" color="dark" />
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="!showcaseStore.projects || showcaseStore.projects.length === 0" class="py-12">
      <p class="text-mono-sm text-gray-400">
        // NO_PROJECTS_FOUND_FOR :: {{ showcaseStore.activeTech }}
      </p>
    </div>

    <!-- Lista -->
    <div v-else class="flex flex-col">
      <div 
        v-for="(project, index) in showcaseStore.projects" 
        :key="project.id"
        class="project-row-wrapper opacity-0" 
      >
        <!-- ProjectRow (oculto cuando expandido) -->
        <ProjectRow 
          v-if="expandedProject?.id !== project.id"
          :project="project" 
          :index="index"
          :is-expanded="expandedProject?.id === project.id"
          @expand="handleExpand"
        />
        
        <!-- ProjectDetail Expandido (reemplaza la fila) -->
        <ProjectDetail
          v-else
          :project="expandedProject"
          :image-rect="expandedImageRect"
          @close="handleCloseDetail"
        />
      </div>
    </div>
  </div>

  <!-- Imagen Fantasma para animación FLIP (Teleportado al body) -->
  <Teleport to="body">
    <div
      v-if="ghostVisible && ghostImageUrl"
      class="ghost-image"
      :style="ghostImageStyle"
    >
      <nuxt-img
        :src="ghostImageUrl"
        alt="Ghost transition"
        class="w-full h-full object-cover"
      />
    </div>
  </Teleport>
</template>
