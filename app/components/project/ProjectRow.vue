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
// [SECTION] :: COMPONENT INTERFACES
// =====================================================================

interface Project {
  id: string;
  title: string;
  img_url?: string | null;
}

interface Props {
  project: Project;
  index: number;
}

const props = defineProps<Props>();

// =====================================================================
// [SECTION] :: COMPONENT STATE & COMPUTED
// =====================================================================

// Format index to always be 2 digits (01, 02, etc.)
const formattedIndex = computed(() => {
  return (props.index + 1).toString().padStart(2, "0");
});

// Hover state
const isHovering = ref(false);
const rowRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);

// Image loading state
const imageLoading = ref(true);

// Image position (calculated from row position)
const imagePosition = ref({ x: 0, y: 0 });

// Calculate marquee duration based on title length for constant speed
const marqueeDuration = computed(() => {
  const titleLength = props.project.title.length;
  const baseDuration = MARQUEE_BASE_DURATION; // seconds for average title
  const factor = titleLength / 20; // average title length
  return Math.max(baseDuration * factor, MARQUEE_MIN_DURATION); // minimum 5s
});

// Store active timeline to kill on new hover
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
  // Kill any previous animation to prevent glitches
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  // Reset loading state for new hover
  imageLoading.value = true;

  // Calculate position before showing
  updateImagePosition();
  isHovering.value = true;

  // Wait for DOM to update after v-if becomes true
  await nextTick();

  // Only animate the image
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
  >
    <!-- Content layer (index + title) -->
    <div class="flex items-center gap-12 pl-2 relative z-10">
      <!-- Index -->
      <span
        class="text-mono-sm transition-colors duration-200"
        :class="isHovering ? 'text-light' : 'text-dark'"
      >
        {{ formattedIndex }}
      </span>

      <!-- Title -->
      <h3
        class="text-2xl font-sans transition-colors duration-200"
        :class="isHovering ? 'text-light' : 'text-dark'"
      >
        {{ project.title }}
      </h3>
    </div>

    <!-- Arrow icon -->
    <div class="pr-4 overflow-hidden relative z-10">
      <span
        class="inline-block text-2xl transition-all duration-200"
        :class="isHovering ? 'text-light translate-x-2' : 'text-dark'"
      >
        <Icon name="material-symbols:arrow-forward" />
      </span>
    </div>

    <!-- Hover overlay with blur + marquee (appears instantly) -->
    <div
      v-if="isHovering && project.img_url"
      class="absolute inset-0 z-20 pointer-events-none overflow-hidden"
    >
      <!-- Dark background + blur overlay -->
      <div class="absolute inset-0 backdrop-blur-xs bg-dark/20"></div>

      <!-- Scrolling Marquee -->
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

  <!-- Project Image Preview (Teleported to body to escape overflow:hidden) -->
  <Teleport to="body">
    <div
      v-if="isHovering && project.img_url"
      ref="imageRef"
      class="fixed z-9999 lg:w-105 lg:h-55 md:w-80 md:h-40 xs:w-64 xs:h-40 rounded-xl overflow-hidden pointer-events-none"
      :class="{ 'shadow-2xl': !imageLoading }"
      :style="{
        left: `${imagePosition.x}px`,
        top: `${imagePosition.y}px`,
        transform: 'translate(-50%, -50%) scale(0.8)',
        opacity: 0,
      }"
    >
      <!-- Loading Spinner -->
      <div 
        v-if="imageLoading" 
        class="absolute inset-0 flex items-center justify-center bg-transparent"
      >
        <UiBrutalSpinner size="sm" color="accent" />
      </div>
      
      <nuxt-img
        :src="project.img_url"
        :alt="project.title"
        class="w-full h-full object-cover"
        @load="imageLoading = false"
      />
      <!-- Dark overlay for uniformity (only show when loaded) -->
      <div v-if="!imageLoading" class="absolute inset-0 bg-dark opacity-[0.1] pointer-events-none"></div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Marquee animation - duration is set dynamically via inline style */
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
