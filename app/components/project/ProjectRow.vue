<script setup lang="ts">
import { gsap } from "gsap";

/**
 * [COMPONENT] :: ProjectRow
 * ----------------------------------------------------------------------
 * Represents a single project in the list with interactive hover effects.
 * Follows the "Structural & Raw" design philosophy.
 *
 * Features:
 * - Image preview with GSAP entrance animation (teleported to body)
 * - Subtle tilt effect following mouse position
 * - Blur overlay on background content
 * - Scrolling "View project" marquee
 *
 * @param {Object} project - Project data including img_url
 * @param {Number} index - Display index (0-based)
 */

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

// Format index to always be 2 digits (01, 02, etc.)
const formattedIndex = computed(() => {
  return (props.index + 1).toString().padStart(2, "0");
});

// Hover state
const isHovering = ref(false);
const rowRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);

// Image position (calculated from row position)
const imagePosition = ref({ x: 0, y: 0 });

// Calculate marquee duration based on title length for constant speed
// ~50 pixels per second as base speed
const marqueeDuration = computed(() => {
  const titleLength = props.project.title.length;
  const baseDuration = 12; // seconds for average title
  const factor = titleLength / 20; // average title length
  return Math.max(baseDuration * factor, 8); // minimum 5s
});

// Store active timeline to kill on new hover
let activeTimeline: gsap.core.Timeline | null = null;

/**
 * Calculate image position based on row - positioned to the right
 */
const updateImagePosition = () => {
  if (!rowRef.value) return;
  const rect = rowRef.value.getBoundingClientRect();
  imagePosition.value = {
    x: rect.left + rect.width * 0.75, // 70% to the right instead of centered
    y: rect.top + rect.height / 2,
  };
};

/**
 * Handle mouse enter - show overlay immediately, animate image
 */
const handleMouseEnter = async () => {
  // Kill any previous animation to prevent glitches
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  // Calculate position before showing
  updateImagePosition();
  isHovering.value = true;

  // Wait for DOM to update after v-if becomes true
  await nextTick();

  // Only animate the image (overlay appears instantly via v-if)
  if (imageRef.value && props.project.img_url) {
    activeTimeline = gsap.timeline();
    activeTimeline.fromTo(
      imageRef.value,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }
    );
  }
};

/**
 * Handle mouse leave - animate out and hide
 */
const handleMouseLeave = () => {
  // Kill any previous animation
  if (activeTimeline) {
    activeTimeline.kill();
    activeTimeline = null;
  }

  // If no image, just hide immediately
  if (!imageRef.value || !props.project.img_url) {
    isHovering.value = false;
    return;
  }

  // Animate image out, then hide overlay
  activeTimeline = gsap.timeline({
    onComplete: () => {
      isHovering.value = false;
      activeTimeline = null;
    },
  });

  activeTimeline.to(imageRef.value, {
    scale: 0.8,
    opacity: 0,
    duration: 0.2,
    ease: "power2.in",
  });
};

/**
 * Handle mouse move - apply subtle tilt effect to image
 */
const handleMouseMove = (event: MouseEvent) => {
  if (!rowRef.value || !imageRef.value || !isHovering.value) return;

  const rect = rowRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Calculate offset from center (normalized to -1 to 1)
  const offsetX = (event.clientX - centerX) / (rect.width / 2);
  const offsetY = (event.clientY - centerY) / (rect.height / 2);

  // Apply subtle movement (max 15px in any direction)
  gsap.to(imageRef.value, {
    x: offsetX * 15,
    y: offsetY * 8,
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto",
  });
};

// Cleanup on unmount
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
            v-for="n in 12"
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
      class="fixed z-9999 lg:w-105 lg:h-55 md:w-80 md:h-40 xs:w-64 xs:h-40 rounded-xl overflow-hidden shadow-2xl pointer-events-none"
      :style="{
        left: `${imagePosition.x}px`,
        top: `${imagePosition.y}px`,
        transform: 'translate(-50%, -50%) scale(0.8)',
        opacity: 0,
      }"
    >
      <nuxt-img
        :src="project.img_url"
        :alt="project.title"
        class="w-full h-full object-cover"
      />
      <!-- Dark overlay for uniformity -->
      <div class="absolute inset-0 bg-dark opacity-[0.1] pointer-events-none"></div>
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
