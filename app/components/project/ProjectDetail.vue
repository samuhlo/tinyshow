<script setup lang="ts">
/**
 * [COMPONENT] :: PROJECT_DETAIL
 * ----------------------------------------------------------------------
 * Drawer/accordion expandible que muestra los detalles de un proyecto.
 * Implementa animación FLIP para la transición de imagen desde el hover.
 * Diseño brutalista con fondo oscuro y tipografía estructural.
 *
 * @module    components/project
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";

// =====================================================================
// [SECTION] :: ANIMATION CONSTANTS
// =====================================================================

const ANIM_DURATION_EXPAND = 0.6;
const ANIM_DURATION_CONTENT = 0.5;
const ANIM_STAGGER_CONTENT = 0.08;
const ANIM_EASE_OUT = "power3.out";
const ANIM_EASE_IN = "power2.in";

const CONTENT_INITIAL_X = 30;
const CONTENT_INITIAL_OPACITY = 0;

// =====================================================================
// [SECTION] :: COMPONENT INTERFACES
// =====================================================================

interface LocalizedText {
  en?: string;
  es?: string;
  [key: string]: string | undefined;
}

interface Origin {
  is_course?: boolean;
  name?: string;
  author?: string;
  url?: string;
}

interface Project {
  id: string;
  title: string;
  tagline?: LocalizedText | unknown;
  description?: LocalizedText | unknown;
  tech_stack?: string[];
  primary_tech?: string;
  img_url?: string | null;
  repo_url?: string;
  demo_url?: string | null;
  origin?: Origin | unknown | null;
}

interface Props {
  project: Project;
  imageRect?: DOMRect | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// =====================================================================
// [SECTION] :: REFS & STATE
// =====================================================================

const detailRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const isAnimating = ref(false);

// i18n locale
const { locale } = useI18n();

// =====================================================================
// [SECTION] :: COMPUTED
// =====================================================================

/**
 * [COMPUTED] :: LOCALIZED_DESCRIPTION
 * Obtiene la descripción en el idioma actual.
 */
const localizedDescription = computed(() => {
  const desc = props.project.description as LocalizedText | null | undefined;
  if (!desc) return "";
  return desc[locale.value as keyof LocalizedText] || desc.en || "";
});

/**
 * [COMPUTED] :: ORIGIN_TEXT
 * Genera el texto de origen en formato de comentario.
 */
const originText = computed(() => {
  const origin = props.project.origin as Origin | null | undefined;
  if (!origin?.name) return null;
  return `// ORIGIN : ${origin.name}${origin.author ? ` by ${origin.author}` : ""}`;
});

// =====================================================================
// [SECTION] :: ANIMATION LOGIC
// =====================================================================

/**
 * [ANIM] :: ANIMATE_ENTER
 * Ejecuta la animación de entrada con FLIP para la imagen.
 */
const animateEnter = async () => {
  if (!detailRef.value) return;
  isAnimating.value = true;

  // Timeline principal
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false;
    },
  });

  // 1. Expandir el contenedor
  tl.fromTo(
    detailRef.value,
    { height: 0, opacity: 0 },
    { height: "auto", opacity: 1, duration: ANIM_DURATION_EXPAND, ease: ANIM_EASE_OUT }
  );

  // 2. Animar imagen con efecto FLIP (si hay imageRect)
  if (imageRef.value && props.imageRect) {
    const finalRect = imageRef.value.getBoundingClientRect();
    const deltaX = props.imageRect.left - finalRect.left;
    const deltaY = props.imageRect.top - finalRect.top;
    const deltaW = props.imageRect.width / finalRect.width;
    const deltaH = props.imageRect.height / finalRect.height;

    tl.fromTo(
      imageRef.value,
      {
        x: deltaX,
        y: deltaY,
        scaleX: deltaW,
        scaleY: deltaH,
        opacity: 0.8,
      },
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        duration: ANIM_DURATION_EXPAND,
        ease: ANIM_EASE_OUT,
      },
      "<0.1"
    );
  } else if (imageRef.value) {
    // Fallback: simple fade in
    tl.fromTo(
      imageRef.value,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: ANIM_DURATION_EXPAND, ease: ANIM_EASE_OUT },
      "<0.1"
    );
  }

  // 3. Animar contenido con stagger
  if (contentRef.value) {
    const contentElements = contentRef.value.querySelectorAll(".content-item");
    tl.fromTo(
      contentElements,
      { x: CONTENT_INITIAL_X, opacity: CONTENT_INITIAL_OPACITY },
      {
        x: 0,
        opacity: 1,
        duration: ANIM_DURATION_CONTENT,
        stagger: ANIM_STAGGER_CONTENT,
        ease: ANIM_EASE_OUT,
      },
      "<0.2"
    );
  }
};

/**
 * [ANIM] :: ANIMATE_EXIT
 * Ejecuta la animación de salida.
 */
const animateExit = () => {
  if (!detailRef.value || isAnimating.value) return;
  isAnimating.value = true;

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false;
      emit("close");
    },
  });

  // 1. Fade out contenido
  if (contentRef.value) {
    const contentElements = contentRef.value.querySelectorAll(".content-item");
    tl.to(contentElements, {
      x: CONTENT_INITIAL_X,
      opacity: 0,
      duration: ANIM_DURATION_CONTENT * 0.6,
      stagger: ANIM_STAGGER_CONTENT * 0.5,
      ease: ANIM_EASE_IN,
    });
  }

  // 2. Colapsar contenedor
  tl.to(
    detailRef.value,
    { height: 0, opacity: 0, duration: ANIM_DURATION_EXPAND * 0.7, ease: ANIM_EASE_IN },
    "<0.1"
  );
};

/**
 * [HANDLE] :: CLOSE
 * Maneja el cierre del detalle.
 */
const handleClose = () => {
  animateExit();
};

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

onMounted(() => {
  nextTick(() => {
    animateEnter();
  });
});
</script>

<template>
  <div ref="detailRef" class="project-detail overflow-hidden bg-dark">
    <div class="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <!-- Close Button -->
      <button class="
      absolute
      top-6
      right-6
      z-10
      text-accent
      text-4xl
      transition-transform
      duration-200
      hover:scale-110
      hover:rotate-90
      flex items-center justify-center origin-center
    " aria-label="Close" @click="handleClose">
        <Icon name="material-symbols:close" />
      </button>

      <!-- Image Section -->
      <div class="project-detail-image relative aspect-video overflow-hidden rounded-lg">
        <div v-if="project.img_url" ref="imageRef" class="w-full h-full">
          <nuxt-img :src="project.img_url" :alt="project.title" class="w-full h-full object-cover" />
          <!-- Dark overlay for uniformity -->
          <div class="absolute inset-0 bg-dark opacity-[0.05] pointer-events-none" />
        </div>
        <!-- Fallback when no image -->
        <div v-else class="w-full h-full flex items-center justify-center bg-dark/50">
          <span class="text-mono-sm text-light/30">// NO_PREVIEW</span>
        </div>
      </div>

      <!-- Content Section -->
      <div ref="contentRef" class="flex flex-col justify-between py-2">
        <!-- Header -->
        <div>
          <!-- Title -->
          <h3 class="content-item font-display text-2xl md:text-3xl uppercase tracking-tight text-light mb-1">
            {{ project.title }}
          </h3>

          <!-- Subtitle -->
          <p class="content-item text-mono-xs text-light/60 mb-6">
            {{ project.primary_tech }} + GSAP Showcase
          </p>

          <!-- Description -->
          <p class="content-item font-mono text-sm text-light/80 leading-relaxed mb-6">
            {{ localizedDescription }}
          </p>

          <!-- Tech Pills -->
          <div class="content-item flex flex-wrap gap-2 mb-8">
            <UiTechPill v-for="tech in project.tech_stack" :key="tech" :text="tech" theme="dark" />
          </div>
        </div>

        <!-- Footer -->
        <div class="space-y-4">
          <!-- Origin -->
          <p v-if="originText" class="content-item text-mono-xs text-light/30">
            {{ originText }}
          </p>

          <!-- Action Links -->
          <div class="content-item flex items-center gap-6">
            <UiActionLink v-if="project.repo_url" :href="project.repo_url" label="GITHUB" icon="mdi:github" />
            <UiActionLink v-if="project.demo_url" :href="project.demo_url" label="DEMO"
              icon="material-symbols:open-in-new" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
