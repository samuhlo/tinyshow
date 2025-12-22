<script setup lang="ts">
/**
 * [PAGE] :: HOME_INDEX
 * ----------------------------------------------------------------------
 * Página principal de la aplicación. Gestiona la transición entre el modo
 * 'Hero' (Landing) y el modo 'Sidebar' (Navegación), coordinando el menú
 * de tecnologías.
 *
 * @module    pages/index
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import TechMenu from "~/components/home/TechMenu.vue";
import ProjectList from "~/components/project/ProjectList.vue";

// =====================================================================
// [SECTION] :: SEO META
// =====================================================================

/**
 * [SEO] :: META_TAGS
 * Configura los metadatos para OpenGraph y Twitter Cards.
 */
useSeoMeta({
  title: "TinyShow",
  description: "Una colección seleccionada de proyectos organizados por tecnología. Explora el show y descubre lo que he aprendido.",
  ogTitle: "TinyShow",
  ogDescription: "Una colección seleccionada de proyectos organizados por tecnología. Explora el show y descubre lo que he aprendido.",
  ogImage: "/og-tinyshow.png",
  ogType: "website",
  twitterTitle: "TinyShow",
  twitterDescription: "Una colección seleccionada de proyectos organizados por tecnología. Explora el show y descubre lo que he aprendido.",
  twitterImage: "/og-tinyshow.png",
  twitterCard: "summary_large_image",
});

// =====================================================================
// [SECTION] :: STORE INTEGRATION
// =====================================================================

const showcaseStore = useShowcaseStore()

// Initialize store data
await showcaseStore.init()

// =====================================================================
// [SECTION] :: LOGIC HANDLERS
// =====================================================================

/**
 * [HANDLE] :: SELECT_TECH
 * Procesa la selección de una tecnología en el menú.
 *
 * @param tech - Nombre de la tecnología seleccionada.
 */
const handleSelect = (tech: string) => {
  showcaseStore.selectTech(tech)
};
</script>

<template>
  <NuxtLayout name="default">
    <!-- Dynamic Layout Container -->
    <div
      class="min-h-[80vh] transition-all duration-500"
      :class="[
        showcaseStore.viewMode === 'hero'
          ? 'flex flex-col items-center justify-center'
          : 'grid grid-cols-1 md:grid-cols-12 gap-10 items-start'
      ]"
    >
      <!-- Navigation Wrapper -->
      <aside
        :class="[
          showcaseStore.viewMode === 'hero'
            ? 'w-full flex justify-center'
            : 'md:col-span-3 lg:col-span-2 pt-0'
        ]"
      >
        <!-- Loading State -->
        <div v-if="showcaseStore.isTechLoading" class="flex items-center justify-center py-12">
          <UiLoadingSpinner size="lg" color="dark" />
        </div>
        
        <TechMenu
          v-else
          :technologies="showcaseStore.technologies"
          :active-tech="showcaseStore.activeTech"
          :view-mode="showcaseStore.viewMode"
          @select="handleSelect"
        />
      </aside>

      <!-- Content Area (Only visible in sidebar mode) -->
      <section
        v-if="showcaseStore.viewMode === 'sidebar'"
        class="md:col-start-5 md:col-span-8 lg:col-start-5 lg:col-span-8 pt-0"
      >
        <ProjectList />
      </section>
    </div>
  </NuxtLayout>
</template>
