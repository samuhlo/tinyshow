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
// [SECTION] :: REMOTE DATA
// =====================================================================

/**
 * [DATA] :: TECHNOLOGIES
 * Lista de tecnologías obtenidas de la API para el menú principal.
 */
const { data: technologies, pending: techPending } = await useFetch<string[]>("/api/projects/techs", {
  default: () => [],
});

// =====================================================================
// [SECTION] :: COMPONENT STATE
// =====================================================================

/**
 * [STATE] :: VIEW_MODE
 * Controla el layout actual de la página (hero | sidebar).
 */
const VIEW_HERO = "hero";
const VIEW_SIDEBAR = "sidebar";

/**
 * [STATE] :: VIEW_MODE
 * Controla el layout actual de la página (hero | sidebar).
 */
const viewMode = ref<typeof VIEW_HERO | typeof VIEW_SIDEBAR>(VIEW_HERO);

/**
 * [STATE] :: ACTIVE_TECH
 * Tecnología actualmente seleccionada por el usuario.
 */
const activeTech = ref<string | null>(null);

// =====================================================================
// [SECTION] :: LOGIC HANDLERS
// =====================================================================

/**
 * [HANDLE] :: SELECT_TECH
 * Procesa la selección de una tecnología en el menú.
 * Transiciona la vista de 'hero' a 'sidebar' si es necesario.
 *
 * @param tech - Nombre de la tecnología seleccionada.
 */
const handleSelect = (tech: string) => {
  activeTech.value = tech;
  
  if (viewMode.value === VIEW_HERO) {
    viewMode.value = VIEW_SIDEBAR;
  }
};
</script>

<template>
  <NuxtLayout name="default">
    <!-- Dynamic Layout Container -->
    <div
      class="min-h-[80vh] transition-all duration-500"
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
        <div v-if="techPending" class="flex items-center justify-center py-12">
          <UiLoadingSpinner size="lg" color="dark" />
        </div>
        
        <TechMenu
          v-else
          :technologies="technologies || []"
          :active-tech="activeTech"
          :view-mode="viewMode"
          @select="handleSelect"
        />
      </aside>

      <!-- Content Area (Only visible in sidebar mode) -->
      <section
        v-if="viewMode === VIEW_SIDEBAR"
        class="md:col-start-5 md:col-span-8 lg:col-start-5 lg:col-span-8 pt-0"
      >
        <ProjectList :tech="activeTech" />
      </section>
    </div>
  </NuxtLayout>
</template>
