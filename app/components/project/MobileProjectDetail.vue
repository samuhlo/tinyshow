<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_DETAIL
 * ----------------------------------------------------------------------
 * Versión RESPONSIVE del ProjectDetail para móvil.
 * Estilos adaptativos usando Container Query Units (cqh).
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

// Estado de carga de imagen
const isImageLoading = ref(true);

// Reiniciar estado de carga cuando cambia el proyecto
watch(() => props.project.id, () => {
  isImageLoading.value = true;
});

// =====================================================================
// [SECTION] :: COMPUTED TEXT
// =====================================================================

/**
 * [COMPUTED] :: LOCALIZED_TAGLINE
 * Obtiene el tagline traducido según el idioma actual.
 */
const localizedTagline = computed(() => {
  const tag = props.project.tagline;
  if (!tag) return "";
  return tag[locale.value as keyof LocalizedTextType] || tag.en || "";
});

/**
 * [COMPUTED] :: LOCALIZED_DESCRIPTION
 * Obtiene la descripción traducida según el idioma actual.
 */
const localizedDescription = computed(() => {
  const desc = props.project.description;
  if (!desc) return "";
  return desc[locale.value as keyof LocalizedTextType] || desc.en || "";
});
</script>

<template>
  <!-- CONTENEDOR RESPONSIVE -->
  <div class="mobile-project-detail bg-dark overflow-hidden h-full flex flex-col cq-container">
    <!-- Sección de Imagen -->
    <div class="relative overflow-hidden shrink-0 p-3 section-image">
      <!-- Spinner de Carga -->
      <div 
        v-if="isImageLoading && project.img_url"
        class="absolute inset-0 flex items-center justify-center bg-dark/80 z-10"
      >
        <UiLoadingSpinner size="sm" color="light" />
      </div>
      
      <!-- Imagen -->
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
      <!-- Capa sutil -->
      <div class="absolute inset-0 bg-dark opacity-[0.05] pointer-events-none"></div>
    </div>

    <!-- Sección de Contenido -->
    <div class="flex-1 overflow-y-auto flex flex-col section-content">
      <!-- Título + Subtítulo -->
      <div class="mb-1">
        <h3 class="font-display uppercase tracking-tight text-light leading-none size-title">
          {{ project.title }}
        </h3>
        <p class="font-mono text-light/50 mt-0.5 size-tagline">
          {{ localizedTagline }}
        </p>
      </div>

      <!-- Descripción -->
      <p class="font-mono text-light/70 leading-snug my-2 size-description">
        {{ localizedDescription }}
      </p>

      <!-- Pills de Tecnología -->
      <div class="flex flex-wrap gap-1 my-2">
        <span
          v-for="tech in project.tech_stack?.slice(0, 3)"
          :key="tech"
          class="font-mono text-light/80 border border-light  px-1.5 py-0.5 size-pill"
        >
          {{ tech }}
        </span>
        <span
          v-if="project.tech_stack && project.tech_stack.length > 3"
          class="font-mono text-light/60 px-1 size-pill"
        >
          +{{ project.tech_stack.length - 3 }}
        </span>
      </div>

      <!-- Info de Origen -->
      <div class="size-origin">
        <ProjectOrigin
          :origin="project.origin as OriginType"
          size="inherit"
        />
      </div>

      <!-- Espaciador -->
      <div class="flex-1"></div>

      <!-- Enlaces de Acción -->
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

<style scoped>
.cq-container {
  container-type: size;
}

.section-image {
  height: clamp(80px, 30cqh, 280px);
  transition: height 0.3s ease;
}

@container (min-height: 350px) {
  .section-image {
    height: clamp(80px, 40cqh, 280px);
  }
}

@container (min-height: 450px) {
  .section-image {
    height: clamp(80px, 50cqh, 280px);
  }
}

.section-content {
  padding: clamp(8px, 2.5cqh, 16px);
}

.size-title {
  font-size: clamp(16px, 4cqh, 24px);
}

.size-tagline {
  font-size: clamp(10px, 2.5cqh, 14px);
}

.size-description {
  font-size: clamp(10px, 2.2cqh, 13px);
}

.size-pill {
  font-size: clamp(10px, 2cqh, 12px);
}

.size-origin {
  font-size: clamp(9px, 1.8cqh, 11px);
}
</style>
