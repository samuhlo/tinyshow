<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_PROJECT_ROW
 * ----------------------------------------------------------------------
 * Versión compacta del ProjectRow para móvil.
 * Sin efectos hover complejos, diseño minimalista.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import type { Project } from "~~/shared/types";

// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  project: Project;
  index: number;
  position: 'above' | 'below';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  expand: [project: Project];
}>();

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

const formattedIndex = computed(() => {
  return (props.index + 1).toString().padStart(2, "0");
});

/**
 * [COMPUTED] :: ARROW_ICON
 * Determina qué icono de flecha mostrar basado en la posición relativa.
 * - 'above': Flecha hacia arriba (el proyecto está antes/arriba).
 * - 'below': Flecha hacia abajo (el proyecto está después/abajo).
 *
 * @returns Nombre del icono de Material Symbols.
 */
const arrowIcon = computed(() => {
  return props.position === 'above' 
    ? 'material-symbols:arrow-upward' 
    : 'material-symbols:arrow-downward';
});

// =====================================================================
// [SECTION] :: HANDLERS
// =====================================================================

/**
 * [HANDLE] :: CLICK
 * Emite el evento de expansión con el proyecto actual.
 *
 * @returns void
 */
const handleClick = () => {
  emit("expand", props.project);
};
</script>

<template>
  <article
    class="mobile-project-row flex items-center justify-between py-3 px-4 border-y border-dark/10 cursor-pointer active:bg-dark/5"
    @click="handleClick"
  >
    <!-- Contenido (índice + título) -->
    <div class="flex items-center gap-6">
      <!-- Índice -->
      <span class="text-mono-xs text-dark/50">
        {{ formattedIndex }}
      </span>

      <!-- Título -->
      <h3 class="text-base font-sans text-dark">
        {{ project.title }}
      </h3>
    </div>

    <!-- Icono de flecha (dinámico según posición) -->
    <div>
      <Icon :name="arrowIcon" class="text-lg text-dark/50" />
    </div>
  </article>
</template>
