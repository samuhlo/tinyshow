<script setup lang="ts">
/**
 * [COMPONENT] :: PROJECT_ROW
 * ----------------------------------------------------------------------
 * Fila interactiva para la visualización de proyectos individuales.
 * Implementa efectos de hover avanzados (image preview, tilt, marquee).
 * Sigue la filosofía de diseño "Structural & Raw".
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import type { Project } from "~~/shared/types";

const IMG_SCALE_INITIAL = 0.8;
const IMG_SCALE_HOVER = 1;
const IMG_OFFSET_X_FACTOR = 0.75;
const TILT_X_FACTOR = 15;
const TILT_Y_FACTOR = 8;
const ANIM_DURATION_ENTER = 0.35;
const ANIM_DURATION_EXIT = 0.2;
const ANIM_DURATION_TILT = 0.3;
const ANIM_EASE_ENTER = "power2.out";
const ANIM_EASE_EXIT = "power2.in";
const MARQUEE_BASE_DURATION = 12;
const MARQUEE_MIN_DURATION = 8;
const MARQUEE_ITEMS_COUNT = 12;


// =====================================================================
// [SECTION] :: COMPONENT PROPS
// =====================================================================

interface Props {
  project: Project;
  index: number;
  isExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isExpanded: false,
});

const emit = defineEmits<{
  expand: [project: Project, imageRect: DOMRect | null];
}>();

// =====================================================================
// [SECTION] :: COMPONENT STATE & COMPUTED
// =====================================================================

// Formatear índice para ser siempre 2 dígitos
const formattedIndex = computed(() => {
  return (props.index + 1).toString().padStart(2, "0");
});

// Estado de hover
const isHovering = ref(false);
const rowRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);

// Obtener store para rastreo de imagen
const showcaseStore = useShowcaseStore();

// Estado de carga de imagen - inicializar desde store
const imageLoading = ref(true);

// Verificar si la imagen ya está cargada al configurar
watchEffect(() => {
  if (props.project.img_url) {
    imageLoading.value = !showcaseStore.isImageLoaded(props.project.img_url);
  }
});

// Posición de imagen (calculada desde posición de fila)
const imagePosition = ref({ x: 0, y: 0 });

// Calcular duración de marquee basada en largo del título para velocidad constante
const marqueeDuration = computed(() => {
  const titleLength = props.project.title.length;
  const baseDuration = MARQUEE_BASE_DURATION; // seconds for average title
  const factor = titleLength / 20; // average title length
  return Math.max(baseDuration * factor, MARQUEE_MIN_DURATION); // minimum 5s
});

// Guardar timeline activo para eliminar en nuevo hover
let activeTimeline: gsap.core.Timeline | null = null;

// =====================================================================
// [SECTION] :: INTERACTION LOGIC
// =====================================================================

/**
 * [CALC] :: UPDATE_IMAGE_POSITION
 * Calcula la posición óptima del preview de imagen relative a la fila.
 */
const updateImagePosition = () => {
  if (!rowRef.value) return;
  const rect = rowRef.value.getBoundingClientRect();
  imagePosition.value = {
    x: rect.left + rect.width * IMG_OFFSET_X_FACTOR, // 75% to the right
    y: rect.top + rect.height / 2,
  };
};

/**
 * [HANDLE] :: ON_MOUSE_ENTER
 * Activa los efectos de hover y dispara la animación de entrada.
 */
const handleMouseEnter = async () => {
  // No mostrar hover cuando está expandido
  if (props.isExpanded) return;
  
  // Matar cualquier animación previa para evitar glitches
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  // Verificar si la imagen ya está cargada desde el store
  if (props.project.img_url) {
    imageLoading.value = !showcaseStore.isImageLoaded(props.project.img_url);
  }

  // Calcular posición antes de mostrar
  updateImagePosition();
  isHovering.value = true;

  // Esperar a actualización del DOM tras v-if
  await nextTick();

  // Solo animar la imagen
  if (imageRef.value && props.project.img_url) {
    activeTimeline = gsap.timeline();
    activeTimeline.fromTo(
      imageRef.value,
      { scale: IMG_SCALE_INITIAL, opacity: 0 },
      { scale: IMG_SCALE_HOVER, opacity: 1, duration: ANIM_DURATION_ENTER, ease: ANIM_EASE_ENTER }
    );
  }
};


/**
 * [HANDLE] :: ON_MOUSE_LEAVE
 * Desactiva los efectos de hover y limpia las animaciones activas.
 */
const handleMouseLeave = () => {
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  if (!imageRef.value || !props.project.img_url) {
    isHovering.value = false;
    return;
  }

  activeTimeline = gsap.timeline({
    onComplete: () => {
      isHovering.value = false;
      activeTimeline = null;
    },
  });

  activeTimeline.to(imageRef.value, {
    scale: IMG_SCALE_INITIAL,
    opacity: 0,
    duration: ANIM_DURATION_EXIT,
    ease: ANIM_EASE_EXIT,
  });
};

/**
 * [HANDLE] :: ON_IMAGE_LOAD
 * Marca la imagen como cargada en el store.
 */
const handleImageLoad = () => {
  imageLoading.value = false;
  if (props.project.img_url) {
    showcaseStore.markImageLoaded(props.project.img_url);
  }
};

/**
 * [HANDLE] :: ON_MOUSE_MOVE
 * Aplica un efecto de inclinación (tilt) dinámico basado en el cursor.
 * @param event - Evento nativo del ratón.
 */
const handleMouseMove = (event: MouseEvent) => {
  if (!rowRef.value || !imageRef.value || !isHovering.value) return;

  const rect = rowRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const offsetX = (event.clientX - centerX) / (rect.width / 2);
  const offsetY = (event.clientY - centerY) / (rect.height / 2);

  gsap.to(imageRef.value, {
    x: offsetX * TILT_X_FACTOR,
    y: offsetY * TILT_Y_FACTOR,
    duration: ANIM_DURATION_TILT,
    ease: ANIM_EASE_ENTER,
    overwrite: "auto",
  });
};

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

/**
 * [HANDLE] :: ON_CLICK
 * Emite el evento de expansión con los datos del proyecto y la posición de la imagen.
 */
const handleClick = () => {
  // Capturar rect de imagen antes de cerrar hover
  let imageRect: DOMRect | null = null;
  if (imageRef.value && isHovering.value) {
    imageRect = imageRef.value.getBoundingClientRect();
  }
  
  // Cerrar hover inmediatamente
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }
  isHovering.value = false;
  
  // Emitir expand con datos completos del proyecto y rect de imagen
  emit("expand", props.project as Project, imageRect);
};

onUnmounted(() => {
  if (activeTimeline) {
    activeTimeline.kill();
  }
});
</script>

<template>
  <article
    ref="rowRef"
    class="project-row group relative flex items-center justify-between py-6 border-b border-dark/10 cursor-pointer overflow-hidden"
    :class="isHovering ? 'bg-dark' : ''"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @click="handleClick"
  >
    <!-- Capa de contenido (índice + título) -->
    <div class="flex items-center gap-12 pl-2 relative z-10">
      <!-- Índice -->
      <span
        class="text-mono-sm transition-colors duration-200"
        :class="isHovering ? 'text-light' : 'text-dark'"
      >
        {{ formattedIndex }}
      </span>

      <!-- Título -->
      <h3
        class="text-2xl font-sans transition-colors duration-200"
        :class="isHovering ? 'text-light' : 'text-dark'"
      >
        {{ project.title }}
      </h3>
    </div>

    <!-- Icono de flecha -->
    <div class="pr-4 overflow-hidden relative z-10">
      <span
        class="inline-block text-2xl transition-all duration-200"
        :class="isHovering ? 'text-light translate-x-2' : 'text-dark'"
      >
        <Icon name="material-symbols:arrow-forward" />
      </span>
    </div>

    <!-- Overlay de hover con desenfoque + marquee (aparece al instante) -->
    <div
      v-if="isHovering && project.img_url"
      class="absolute inset-0 z-20 pointer-events-none overflow-hidden"
    >
      <!-- Fondo oscuro + overlay desenfocado -->
      <div class="absolute inset-0 backdrop-blur-xs bg-dark/20"></div>

      <!-- Marquee desplazable -->
      <div class="absolute inset-0 flex items-center overflow-hidden">
        <div
          class="marquee-track flex whitespace-nowrap"
          :style="{ animationDuration: `${marqueeDuration}s` }"
        >
          <span
            v-for="n in MARQUEE_ITEMS_COUNT"
            :key="n"
            class="marquee-item text-light/80 text-sm font-mono mx-6 tracking-wide"
          >
            [ View {{ project.title }} ]
          </span>
        </div>
      </div>
    </div>
  </article>

  <!-- Preview de Imagen (Teleportado al body para escapar de overflow:hidden) -->
  <Teleport to="body">
    <div
      v-if="isHovering && project.img_url"
      ref="imageRef"
      class="fixed z-9999 lg:w-105 lg:h-55 md:w-80 md:h-40 xs:w-64 xs:h-40  overflow-hidden pointer-events-none"
      :class="{ 'shadow-2xl': !imageLoading }"
      :style="{
        left: `${imagePosition.x}px`,
        top: `${imagePosition.y}px`,
        transform: 'translate(-50%, -50%) scale(0.8)',
        opacity: 0,
      }"
    >
      <!-- Spinner de Carga -->
      <div 
        v-if="imageLoading" 
        class="absolute inset-0 flex items-center justify-center bg-transparent"
      >
        <UiLoadingSpinner size="sm" color="accent" />
      </div>
      
      <nuxt-img
        :src="project.img_url"
        :alt="project.title"
        class="w-full h-full object-cover"
        @load="handleImageLoad"
      />
      <!-- Capa oscura para uniformidad (solo mostrar cuando cargado) -->
      <div v-if="!imageLoading" class="absolute inset-0 bg-dark opacity-[0.1] pointer-events-none"></div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Animación Marquee - duración configurada dinámicamente vía estilo inline */
.marquee-track {
  animation: marquee linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
