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

import { storeToRefs } from "pinia";
import { useShowcaseStore } from "~/composables/stores/useShowcaseStore";
import { useDataStore } from "~/composables/stores/useDataStore";
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
// [SECTION] :: STORES
// =====================================================================

const VIEW_HERO = "hero";
const VIEW_SIDEBAR = "sidebar";

/**
 * [STORE] :: SHOWCASE_STORE
 * Store centralizado para gestionar viewMode y activeTech.
 */
const showcaseStore = useShowcaseStore();
const { viewMode } = storeToRefs(showcaseStore);

/**
 * [STORE] :: DATA_STORE
 * Store centralizado para tecnologías y proyectos cacheados.
 */
const dataStore = useDataStore();
const { technologies, technologiesLoading } = storeToRefs(dataStore);

// Fetch technologies on mount (cached by store)
await dataStore.fetchTechnologies();
</script>

<template>
  <NuxtLayout name="default">
    <!-- Dynamic Layout Container -->
    <div
      class="min-h-[calc(100vh-6rem)] md:min-h-[80vh]"
      :class="[
        viewMode === VIEW_HERO
          ? 'flex flex-col items-center justify-center'
          : 'grid grid-cols-1 md:grid-cols-12 gap-10 items-start'
      ]"
    >
      <!-- Navigation Wrapper -->
      <aside
        :class="[
          viewMode === VIEW_HERO
            ? 'w-full flex justify-center'
            : 'md:col-span-3 lg:col-span-2 pt-0'
        ]"
      >
        <!-- Loading State -->
        <div 
          class="transition-[opacity,transform] duration-700 ease-out"
          :class="showcaseStore.isIntroAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0 delay-75'"
        >
          <div v-if="technologiesLoading" class="flex items-center justify-center py-12">
            <UiLoadingSpinner size="lg" color="dark" />
          </div>
          
          <TechMenu v-else />
        </div>
      </aside>

      <!-- Content Area (Only visible in sidebar mode) -->
      <section
        v-if="viewMode === VIEW_SIDEBAR"
        class="md:col-start-5 md:col-span-8 lg:col-start-5 lg:col-span-8 pt-0"
      >
        <ProjectList />
      </section>
    </div>
  </NuxtLayout>
</template>
