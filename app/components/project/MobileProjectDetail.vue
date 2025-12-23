<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_DETAIL
 * ----------------------------------------------------------------------
 * Versión RESPONSIVE del ProjectDetail para móvil.
 * TODAS las alturas y tamaños se calculan dinámicamente basándose
 * en la altura del viewport para adaptarse a cualquier dispositivo.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import type { Project, LocalizedTextType, OriginType } from "~~/shared/types";

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  project: Project;
}

const props = defineProps<Props>();

// =====================================================================
// [SECTION] :: STATE
// =====================================================================

const { locale } = useI18n();

// Container ref for measuring
const containerRef = ref<HTMLElement | null>(null);
const containerHeight = ref(0);

// Image loading state
const isImageLoading = ref(true);

// Reset loading state when project changes
watch(() => props.project.id, () => {
  isImageLoading.value = true;
});

// =====================================================================
// [SECTION] :: DYNAMIC SIZING
// =====================================================================

/**
 * [COMPUTED] :: DYNAMIC_STYLES
 * Calcula estilos basados en la altura disponible del contenedor.
 * Esto asegura que el layout se adapte a cualquier tamaño de pantalla.
 */
const dynamicStyles = computed(() => {
  const h = containerHeight.value;
  
  // Si no tenemos altura, usar defaults seguros
  if (h === 0) {
    return {
      imageHeight: '120px',
      contentPadding: '12px',
      titleSize: '18px',
      taglineSize: '12px',
      descriptionSize: '11px',
      originSize: '8px',
      pillSize: '10px',
      descriptionLines: 3,
    };
  }
  
  // Calcular proporciones basadas en altura disponible
  // Imagen: porcentaje dinámico - más pequeño en pantallas pequeñas
  const imagePercent = h > 450 ? 0.50 : h > 350 ? 0.40 : 0.30;
  const imageHeight = Math.min(Math.max(h * imagePercent, 80), 280);
  
  // Padding del contenido: proporcional a la altura
  const contentPadding = Math.min(Math.max(h * 0.025, 8), 16);
  
  // Tamaños de fuente: escalan con la altura
  const titleSize = Math.min(Math.max(h * 0.04, 16), 24);
  const taglineSize = Math.min(Math.max(h * 0.025, 10), 14);
  const descriptionSize = Math.min(Math.max(h * 0.022, 10), 13);
  const pillSize = Math.min(Math.max(h * 0.02, 9), 12);
  const originSize = Math.min(Math.max(h * 0.018, 8), 11);
  
  // Líneas de descripción: sin límite, mostrar toda la descripción
  const descriptionLines = 99;
  
  return {
    imageHeight: `${imageHeight}px`,
    contentPadding: `${contentPadding}px`,
    titleSize: `${titleSize}px`,
    taglineSize: `${taglineSize}px`,
    descriptionSize: `${descriptionSize}px`,
    pillSize: `${pillSize}px`,
    originSize: `${originSize}px`,
    descriptionLines,
  };
});

// =====================================================================
// [SECTION] :: COMPUTED TEXT
// =====================================================================

/**
 * [COMPUTED] :: LOCALIZED_TAGLINE
 */
const localizedTagline = computed(() => {
  const tag = props.project.tagline;
  if (!tag) return "";
  return tag[locale.value as keyof LocalizedTextType] || tag.en || "";
});

/**
 * [COMPUTED] :: LOCALIZED_DESCRIPTION
 */
const localizedDescription = computed(() => {
  const desc = props.project.description;
  if (!desc) return "";
  return desc[locale.value as keyof LocalizedTextType] || desc.en || "";
});

/**
 * [COMPUTED] :: TRUNCATED_DESCRIPTION
 * Trunca basándose en líneas disponibles.
 */
const truncatedDescription = computed(() => {
  const desc = localizedDescription.value;
  const maxChars = dynamicStyles.value.descriptionLines * 50; // ~50 chars per line
  if (desc.length <= maxChars) return desc;
  return desc.slice(0, maxChars).trim() + "...";
});

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

/**
 * [LIFECYCLE] :: MEASURE_CONTAINER
 * Mide la altura del contenedor después de montarse.
 */
onMounted(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight;
  }
  
  // Re-measure on resize
  if (import.meta.client) {
    window.addEventListener('resize', measureContainer);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', measureContainer);
  }
});

const measureContainer = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight;
  }
};

// Watch for container changes
watch(containerRef, () => {
  nextTick(() => {
    measureContainer();
  });
});
</script>

<template>
  <!-- RESPONSIVE CONTAINER - fills available space, measures itself -->
  <div 
    ref="containerRef"
    class="mobile-project-detail bg-dark overflow-hidden h-full flex flex-col "
  >
    <!-- Image Section (dynamic height) -->
    <div 
      class="relative overflow-hidden shrink-0 p-3"
      :style="{ height: dynamicStyles.imageHeight }"
    >
      <!-- Loading Spinner (shows while image loads) -->
      <div 
        v-if="isImageLoading && project.img_url"
        class="absolute inset-0 flex items-center justify-center bg-dark/80 z-10"
      >
        <UiLoadingSpinner size="sm" color="light" />
      </div>
      
      <!-- Image -->
      <nuxt-img
        v-if="project.img_url"
        :src="project.img_url"
        :alt="project.title"
        class="w-full h-full object-cover"
        @load="isImageLoading = false"
        @error="isImageLoading = false"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-dark/50">
        <span class="text-mono-xs text-light/30">// NO_PREVIEW</span>
      </div>
      <!-- Subtle overlay -->
      <div class="absolute inset-0 bg-dark opacity-[0.05] pointer-events-none"></div>
    </div>

    <!-- Content Section (dynamic padding, flex to push buttons down) -->
    <div 
      class="flex-1 overflow-y-auto flex flex-col"
      :style="{ padding: dynamicStyles.contentPadding }"
    >
      <!-- Title + Subtitle -->
      <div class="mb-1">
        <h3 
          class="font-display uppercase tracking-tight text-light leading-none"
          :style="{ fontSize: dynamicStyles.titleSize }"
        >
          {{ project.title }}
        </h3>
        <p 
          class="font-mono text-light/50 mt-0.5"
          :style="{ fontSize: dynamicStyles.taglineSize }"
        >
          {{ localizedTagline }}
        </p>
      </div>

      <!-- Description (dynamic size and clipping) -->
      <p 
        class="font-mono text-light/70 leading-snug my-2"
        :style="{ 
          fontSize: dynamicStyles.descriptionSize,
          display: '-webkit-box',
          WebkitLineClamp: dynamicStyles.descriptionLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }"
      >
        {{ truncatedDescription }}
      </p>

      <!-- Tech Pills (dynamic size) -->
      <div class="flex flex-wrap gap-1 my-2">
        <span
          v-for="tech in project.tech_stack?.slice(0, 3)"
          :key="tech"
          class="font-mono text-light/80 border border-light/30 rounded px-1.5 py-0.5"
          :style="{ fontSize: dynamicStyles.pillSize }"
        >
          {{ tech }}
        </span>
        <span
          v-if="project.tech_stack && project.tech_stack.length > 3"
          class="font-mono text-light/40 px-1"
          :style="{ fontSize: dynamicStyles.pillSize }"
        >
          +{{ project.tech_stack.length - 3 }}
        </span>
      </div>

      <!-- Origin Info (full, with links, dynamic size) -->
      <div :style="{ fontSize: dynamicStyles.originSize }">
        <ProjectOrigin
          :origin="project.origin as OriginType"
          size="inherit"
        />
      </div>

      <!-- Spacer to push buttons to bottom -->
      <div class="flex-1"></div>

      <!-- Action Links (always at bottom) -->
      <div class="flex items-center gap-4 justify-end pt-2">
        <UiActionLink
          v-if="project.repo_url"
          :href="project.repo_url"
          label="GITHUB"
          icon="mdi:github"
          size="sm"
        />
        <UiActionLink
          v-if="project.demo_url"
          :href="project.demo_url"
          label="DEMO"
          icon="material-symbols:open-in-new"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
