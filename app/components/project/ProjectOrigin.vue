<!--
  [COMPONENT] :: PROJECT_ORIGIN
  ----------------------------------------------------------------------
  Muestra la información de origen del proyecto (curso, autor) con enlaces
  opcionales y estilos de hover sutiles.
  
  Format: // ORIGIN : <Course> [by <Author>]
  ----------------------------------------------------------------------
-->
<script setup lang="ts">
import type { OriginType } from "~~/shared/types";

interface Props {
  origin: OriginType;
  size?: 'xs' | 'inherit';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'xs',
});

const { locale } = useI18n();

// Computed class para el tamaño del texto
const textSizeClass = computed(() => 
  props.size === 'inherit' ? 'text-inherit' : 'text-xs'
);
</script>

<template>
  <div :class="['font-mono opacity-60 flex flex-wrap gap-1', textSizeClass]">
    <span class="text-light/50 mr-1">// ORIGIN :</span>
    
    <template v-if="origin">
      <!-- Nombre del Curso -->
      <a 
        v-if="origin.course_url" 
        :href="origin.course_url" 
        target="_blank" 
        rel="noopener noreferrer"
        class="group relative cursor-pointer text-light/60 transition-colors duration-200 hover:text-white"
      >
        {{ origin.name || 'Unknown Course' }}
        <span class="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
      </a>
      <span v-else class="text-light/60">
        {{ origin.name || 'Unknown Course' }}
      </span>

      <!-- Autor (Opcional) -->
      <template v-if="origin.author">
        <span class="text-light/50 mx-1">by</span>
        
        <a 
          v-if="origin.author_url" 
          :href="origin.author_url" 
          target="_blank" 
          rel="noopener noreferrer"
          class="group relative cursor-pointer text-light/60 transition-colors duration-200 hover:text-white"
        >
          {{ origin.author }}
          <span class="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
        </a>
        <span v-else class="text-light/60">
          {{ origin.author }}
        </span>
      </template>
    </template>
    
    <!-- Fallback para Proyecto Propio -->
    <span v-else class="text-light/60">
      {{ locale === 'es' ? 'Pruebas Propias' : 'Own Experiments' }}
    </span>
  </div>
</template>
