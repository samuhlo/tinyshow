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

/**
 * [STATE] :: TECHNOLOGIES_LIST
 * Lista estática de tecnologías disponibles en el portfolio.
 */
const technologies = ["Vue.js", "Nuxt", "React", "Astro", "Node.js"];

/**
 * [STATE] :: VIEW_MODE
 * Controla el layout actual de la página.
 * @type {Ref<'hero' | 'sidebar'>}
 */
const viewMode = ref<"hero" | "sidebar">("hero");

/**
 * [STATE] :: ACTIVE_TECH
 * Tecnología actualmente seleccionada por el usuario.
 * @type {Ref<string | null>}
 */
const activeTech = ref<string | null>(null);

/**
 * [HANDLE] :: SELECT_TECH
 * Procesa la selección de una tecnología en el menú.
 * Transiciona la vista de 'hero' a 'sidebar' si es necesario.
 *
 * @param   {String}  tech  - Nombre de la tecnología seleccionada.
 * @returns {void}
 */
const handleSelect = (tech: string) => {
  activeTech.value = tech;
  
  if (viewMode.value === "hero") {
    viewMode.value = "sidebar";
  }
};
</script>

<template>
  <NuxtLayout name="default">
    <!-- Hero Mode Container -->
    <div
      v-if="viewMode === 'hero'"
      class="flex flex-col items-center justify-center min-h-[80vh]"
    >
      <TechMenu
        :technologies="technologies"
        :active-tech="activeTech"
        :view-mode="viewMode"
        @select="handleSelect"
      />
    </div>

    <!-- Sidebar Mode Container (Grid) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-10">
      <!-- Left Column: Navigation -->
      <aside class="md:col-span-3 lg:col-span-2 pt-0">
        <TechMenu
          :technologies="technologies"
          :active-tech="activeTech"
          :view-mode="viewMode"
          @select="handleSelect"
        />
      </aside>

      <!-- Right Column: Content (Future Project List) -->
      <section class="md:col-span-9 lg:col-span-10 pt-0">
         <!-- Content removed for now as requested -->
      </section>
    </div>
  </NuxtLayout>
</template>
