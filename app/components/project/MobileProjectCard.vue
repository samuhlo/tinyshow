<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_CARD
 * ----------------------------------------------------------------------
 * Card individual para vista móvil de proyectos.
 * Alterna entre estados activo (expandido/centrado) e inactivo (colapsado).
 * Utiliza GSAP para transiciones suaves entre estados.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import type { Project, LocalizedTextType, OriginType } from "~~/shared/types";

// =====================================================================
// [SECTION] :: ANIMATION CONSTANTS
// =====================================================================

const ANIM_DURATION_STATE = 0.5;
const ANIM_EASE_OUT = "power3.out";
const SCALE_INACTIVE = 0.85;
const SCALE_ACTIVE = 1;
const OPACITY_INACTIVE = 0.6;
const OPACITY_ACTIVE = 1;

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  project: Project;
  isActive: boolean;
  position: number; // -2, -1, 0, 1, 2 (0 is centered)
}

const props = defineProps<Props>();

// =====================================================================
// [SECTION] :: REFS & STATE
// =====================================================================

const cardRef = ref<HTMLElement | null>(null);
const showcaseStore = useShowcaseStore();

// i18n locale
const { locale } = useI18n();

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

/**
 * [COMPUTED] :: LOCALIZED_DESCRIPTION
 * Obtiene la descripción en el idioma actual.
 */
const localizedDescription = computed(() => {
  const desc = props.project.description;
  if (!desc) return "";
  return desc[locale.value as keyof LocalizedTextType] || desc.en || "";
});

/**
 * [COMPUTED] :: IS_IMAGE_LOADED
 * Verifica si la imagen ya está cargada en el store.
 */
const isImageLoaded = computed(() => {
  return showcaseStore.isImageLoaded(props.project.img_url);
});

// =====================================================================
// [SECTION] :: ANIMATION LOGIC
// =====================================================================

/**
 * [ANIM] :: ANIMATE_STATE_CHANGE
 * Anima la transición entre estados activo/inactivo.
 */
const animateStateChange = (toActive: boolean) => {
  if (!cardRef.value) return;

  gsap.to(cardRef.value, {
    scale: toActive ? SCALE_ACTIVE : SCALE_INACTIVE,
    opacity: toActive ? OPACITY_ACTIVE : OPACITY_INACTIVE,
    duration: ANIM_DURATION_STATE,
    ease: ANIM_EASE_OUT,
  });
};

/**
 * [HANDLE] :: ON_IMAGE_LOAD
 * Marca la imagen como cargada en el store.
 */
const handleImageLoad = () => {
  if (props.project.img_url) {
    showcaseStore.markImageLoaded(props.project.img_url);
  }
};

// =====================================================================
// [SECTION] :: WATCHERS & LIFECYCLE
// =====================================================================

// Watch para cambios en el estado activo
watch(
  () => props.isActive,
  (newVal) => {
    animateStateChange(newVal);
  }
);

// Inicializar estado en mount
onMounted(() => {
  if (cardRef.value) {
    gsap.set(cardRef.value, {
      scale: props.isActive ? SCALE_ACTIVE : SCALE_INACTIVE,
      opacity: props.isActive ? OPACITY_ACTIVE : OPACITY_INACTIVE,
    });
  }
});
</script>

<template>
  <article
    ref="cardRef"
    class="mobile-project-card w-full transition-transform will-change-transform"
    :class="[
      isActive ? 'z-10' : 'z-0',
      position === 0 ? 'my-6' : 'my-2'
    ]"
  >
    <!-- INACTIVE STATE: Collapsed card with image + title overlay -->
    <div
      v-if="!isActive"
      class="relative w-full aspect-video rounded-xl overflow-hidden bg-dark"
    >
      <!-- Image with dark overlay -->
      <div v-if="project.img_url" class="w-full h-full relative">
        <nuxt-img
          :src="project.img_url"
          :alt="project.title"
          class="w-full h-full object-cover"
          @load="handleImageLoad"
        />
        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-dark/60"></div>
      </div>
      
      <!-- Fallback when no image -->
      <div v-else class="w-full h-full flex items-center justify-center bg-dark/90">
        <span class="text-mono-sm text-light/30">// NO_PREVIEW</span>
      </div>

      <!-- Title overlay -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <h3 class="font-display text-xl md:text-2xl uppercase tracking-tight text-light text-center line-clamp-2">
          {{ project.title }}
        </h3>
      </div>
    </div>

    <!-- ACTIVE STATE: Expanded card with full details -->
    <div
      v-else
      class="bg-dark rounded-2xl overflow-hidden shadow-2xl"
    >
      <div class="relative">
        <!-- Image Section -->
        <div class="relative aspect-video overflow-hidden">
          <div v-if="project.img_url" class="w-full h-full">
            <nuxt-img
              :src="project.img_url"
              :alt="project.title"
              class="w-full h-full object-cover"
              @load="handleImageLoad"
            />
            <!-- Subtle dark overlay for uniformity -->
            <div class="absolute inset-0 bg-dark opacity-[0.05] pointer-events-none"></div>
          </div>
          <!-- Fallback when no image -->
          <div v-else class="w-full h-full flex items-center justify-center bg-dark/50">
            <span class="text-mono-sm text-light/30">// NO_PREVIEW</span>
          </div>
        </div>

        <!-- Content Section -->
        <div class="p-6 space-y-4">
          <!-- Title -->
          <h3 class="font-display text-2xl md:text-3xl uppercase tracking-tight text-light">
            {{ project.title }}
          </h3>

          <!-- Subtitle -->
          <p class="text-mono-xs text-light/60">
            {{ project.primary_tech }} + GSAP Showcase
          </p>

          <!-- Description -->
          <p class="font-mono text-sm text-light/80 leading-relaxed">
            {{ localizedDescription }}
          </p>

          <!-- Tech Pills -->
          <div class="flex flex-wrap gap-2">
            <UiTechPill
              v-for="tech in project.tech_stack"
              :key="tech"
              :text="tech"
              theme="dark"
            />
          </div>

          <!-- Origin Info -->
          <div>
            <ProjectOrigin
              :origin="project.origin as OriginType"
            />
          </div>

          <!-- Action Links -->
          <div class="flex items-center gap-6 justify-end pt-2">
            <UiActionLink
              v-if="project.repo_url"
              :href="project.repo_url"
              label="GITHUB"
              icon="mdi:github"
            />
            <UiActionLink
              v-if="project.demo_url"
              :href="project.demo_url"
              label="DEMO"
              icon="material-symbols:open-in-new"
            />
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
