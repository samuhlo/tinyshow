<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_DETAIL
 * ----------------------------------------------------------------------
 * Versión compacta del ProjectDetail para móvil.
 * Layout vertical, imagen más pequeña, todo visible sin scroll.
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

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

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
 * Limita la descripción a ~150 caracteres para móvil.
 */
const truncatedDescription = computed(() => {
  const desc = localizedDescription.value;
  if (desc.length <= 150) return desc;
  return desc.slice(0, 150).trim() + "...";
});
</script>

<template>
  <div class="mobile-project-detail bg-dark overflow-hidden">
    <!-- Image Section (compact) -->
    <div class="relative aspect-video overflow-hidden">
      <nuxt-img
        v-if="project.img_url"
        :src="project.img_url"
        :alt="project.title"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-dark/50">
        <span class="text-mono-xs text-light/30">// NO_PREVIEW</span>
      </div>
      <!-- Subtle overlay -->
      <div class="absolute inset-0 bg-dark opacity-[0.05] pointer-events-none"></div>
    </div>

    <!-- Content Section (compact) -->
    <div class="p-4 space-y-3">
      <!-- Title -->
      <h3 class="font-display text-xl uppercase tracking-tight text-light leading-tight">
        {{ project.title }}
      </h3>

      <!-- Subtitle -->
      <p class="text-mono-xs text-light/50">
        {{ project.primary_tech }} + GSAP Showcase
      </p>

      <!-- Description (truncated) -->
      <p class="font-mono text-xs text-light/70 leading-relaxed">
        {{ truncatedDescription }}
      </p>

      <!-- Tech Pills (compact) -->
      <div class="flex flex-wrap gap-1.5">
        <UiTechPill
          v-for="tech in project.tech_stack?.slice(0, 4)"
          :key="tech"
          :text="tech"
          theme="dark"
          size="sm"
        />
        <span
          v-if="project.tech_stack && project.tech_stack.length > 4"
          class="text-mono-xs text-light/40"
        >
          +{{ project.tech_stack.length - 4 }}
        </span>
      </div>

      <!-- Origin Info (compact) -->
      <ProjectOrigin
        :origin="project.origin as OriginType"
        size="sm"
      />

      <!-- Action Links -->
      <div class="flex items-center gap-4 justify-end pt-1">
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
