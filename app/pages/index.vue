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
/**
 * [STATE] :: TECHNOLOGIES_LIST
 * Lista de tecnologías obtenidas de la API.
 */
const { data: technologies } = await useFetch<string[]>("/api/projects/techs", {
  default: () => [],
});


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
    <!-- Dynamic Layout Container -->
    <div
      class="min-h-[80vh] transition-all duration-500"
      :class="[
        viewMode === 'hero'
          ? 'flex flex-col items-center justify-center'
          : 'grid grid-cols-1 md:grid-cols-12 gap-10 items-start'
      ]"
    >
      <!-- Navigation Wrapper -->
      <aside
        :class="[
          viewMode === 'hero'
            ? 'w-full flex justify-center'
            : 'md:col-span-3 lg:col-span-2 pt-0'
        ]"
      >
        <TechMenu
          :technologies="technologies || []"
          :active-tech="activeTech"
          :view-mode="viewMode"
          @select="handleSelect"
        />
      </aside>

      <!-- Content Area (Only visible in sidebar mode) -->
      <section
        v-if="viewMode === 'sidebar'"
        class="md:col-span-9 lg:col-span-10 pt-0 opacity-0 animate-fade-in"
        :style="{ animationFillMode: 'forwards', animationDelay: '0.3s' }"
      >
         <!-- Content placeholder -->
         <div class="prose dark:prose-invert">
            <h1>{{ activeTech }} Projects</h1>
            <p>Project list coming soon...</p>
         </div>
      </section>
    </div>
  </NuxtLayout>
</template>
