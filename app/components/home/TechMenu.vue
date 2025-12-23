<script setup lang="ts">
/**
 * [COMPONENT] :: TECH_MENU
 * ----------------------------------------------------------------------
 * Menú de navegación principal basado en tecnologías.
 * Implementa animaciones FLIP para transicionar entre estados Hero y Sidebar.
 * Soporta modo 'Downbar' para móviles.
 *
 * @module    components/home
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { useUiStore } from "~/stores/useUiStore";

gsap.registerPlugin(Flip);

const VIEW_HERO = "hero";
const VIEW_SIDEBAR = "sidebar";

const ANIM_FLIP_DURATION = 0.8;
const ANIM_FLIP_STAGGER = 0.15;
const ANIM_INDICATOR_DURATION = 0.5;
const ANIM_HIDE_DURATION = 0.3;
const ANIM_FADE_IN_DURATION = 0.4;

const EASE_EXPO_OUT = "expo.out";
const EASE_POWER2_IN = "power2.in";
const EASE_POWER2_OUT = "power2.out";


// =====================================================================
// [SECTION] :: COMPONENT PROPS & EMITS
// =====================================================================

interface Props {
  technologies: string[];
  activeTech: string | null;
  viewMode: "hero" | "sidebar";
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "select", tech: string): void;
}>();

// =====================================================================
// [SECTION] :: COMPONENT STATE & REFS
// =====================================================================

const uiStore = useUiStore();
const menuRef = ref<HTMLElement | null>(null);
const indicatorRef = ref<HTMLElement | null>(null);
const buttonRefs = ref<HTMLElement[]>([]);
const downbarRectsRef = ref<HTMLElement | null>(null);

// =====================================================================
// [SECTION] :: ANIMATION LOGIC
// =====================================================================

/**
 * [SET] :: SET_BUTTON_REF
 * Almacena la referencia del DOM para un botón de tecnología.
 * @param el    - Elemento del botón.
 * @param index - Índice en la lista.
 */
const setButtonRef = (el: HTMLElement | null, index: number) => {
  if (el) buttonRefs.value[index] = el;
};

/**
 * [ANIM] :: ANIMATE_INDICATOR
 * Desplaza el indicador visual hacia el botón de la tecnología activa (Desktop).
 */
const animateIndicator = () => {
  // Mobile Downbar handles active state differently (rectangles)
  if (uiStore.isMobile) return;
  
  if (!indicatorRef.value || !props.activeTech || props.viewMode !== VIEW_SIDEBAR) return;

  const activeIndex = props.technologies.indexOf(props.activeTech);
  if (activeIndex === -1) return;

  const activeButton = buttonRefs.value[activeIndex];
  if (!activeButton || !menuRef.value) return;

  const menuRect = menuRef.value.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();

  // Calcula la posición relativa al contenedor del menú
  const targetY = buttonRect.top - menuRect.top + (buttonRect.height / 2) - 16;

  gsap.to(indicatorRef.value, {
    y: targetY,
    opacity: 1,
    scaleY: 1,
    duration: ANIM_INDICATOR_DURATION,
    ease: EASE_EXPO_OUT,
  });
};

/**
 * [ANIM] :: HIDE_INDICATOR
 * Oculta el indicador visual con una transición suave.
 */
const hideIndicator = () => {
  if (!indicatorRef.value) return;
  
  gsap.to(indicatorRef.value, {
    opacity: 0,
    scaleY: 0,
    duration: ANIM_HIDE_DURATION,
    ease: EASE_POWER2_IN,
  });
};

// =====================================================================
// [SECTION] :: WATCHERS & LIFECYCLE
// =====================================================================

// Watch para cambios de viewMode - FLIP Animation
watch(
  () => props.viewMode,
  async (newMode, oldMode) => {
    if (!menuRef.value) return;

    // Mobile: Handle specific transitions if needed, but FLIP might be overkill 
    // for list -> downbar. We might just fade list out and slide downbar up.
    // For now, let's keep it simple for desktop, and skip FLIP on mobile if switch to downbar
    
    if (uiStore.isMobile && newMode === VIEW_SIDEBAR) {
       // Mobile transition handled by CSS/Vue transition mostly
       return; 
    }

    // Captura el estado antes del cambio (sin color para evitar glitch)
    const buttons = menuRef.value.querySelectorAll(".tech-btn");
    const state = Flip.getState(buttons, {
      props: "fontSize,lineHeight,letterSpacing",
    });

    // Espera a que Vue actualice el DOM
    await nextTick();

    // Crea un timeline para coordinar las animaciones
    const tl = gsap.timeline();

    // FLIP animation con stagger y easing premium
    tl.add(
      Flip.from(state, {
        duration: ANIM_FLIP_DURATION,
        ease: EASE_EXPO_OUT,
        stagger: {
          amount: ANIM_FLIP_STAGGER,
          from: "start",
        },
        absolute: true,
        onComplete: () => {
          // Anima el indicador después de que los botones estén en su lugar
          if (newMode === VIEW_SIDEBAR) {
            setTimeout(animateIndicator, 50);
          }
        },
      })
    );

    // Si cambiamos a hero, oculta el indicador
    if (newMode === VIEW_HERO) {
      hideIndicator();
    }

    // Animación de entrada para los colores en modo sidebar
    if (newMode === VIEW_SIDEBAR) {
      tl.to(
        buttons,
        {
          opacity: 1,
          duration: ANIM_FADE_IN_DURATION,
          stagger: 0.05,
          ease: EASE_POWER2_OUT,
        },
        "-=0.4"
      );
    }
  }
);

// Watch para cambios del activeTech - Indicador flotante
watch(
  () => props.activeTech,
  async (newTech, oldTech) => {
    if (props.viewMode !== VIEW_SIDEBAR || !newTech) return;

    await nextTick();
    animateIndicator();
  }
);

// =====================================================================
// [SECTION] :: SWIPE NAVIGATION (Mobile)
// =====================================================================

const touchStartX = ref(0);
const SWIPE_THRESHOLD = 50; // Minimum px to register as swipe

const handleTouchStart = (e: TouchEvent) => {
  const firstTouch = e.touches[0];
  if (firstTouch) {
    touchStartX.value = firstTouch.clientX;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  const endTouch = e.changedTouches[0];
  if (!endTouch) return;
  
  const touchEndX = endTouch.clientX;
  const deltaX = touchEndX - touchStartX.value;

  if (Math.abs(deltaX) < SWIPE_THRESHOLD) return; // Not a swipe

  const currentIndex = props.technologies.indexOf(props.activeTech || '');
  if (currentIndex === -1) return;

  if (deltaX > 0) {
    // Swiped RIGHT -> go to PREVIOUS tech
    const prevIndex = currentIndex - 1;
    const prevTech = props.technologies[prevIndex];
    if (prevIndex >= 0 && prevTech) {
      emit('select', prevTech);
    }
  } else {
    // Swiped LEFT -> go to NEXT tech
    const nextIndex = currentIndex + 1;
    const nextTech = props.technologies[nextIndex];
    if (nextIndex < props.technologies.length && nextTech) {
      emit('select', nextTech);
    }
  }
};

// =====================================================================
// [SECTION] :: MOBILE HERO TO DOWNBAR TRANSITION
// =====================================================================

/**
 * [ANIM] :: HANDLE_MOBILE_SELECT
 * Simple fadeout transition from Hero list to Downbar on mobile.
 * @param tech - The selected technology.
 * @param index - Index of the selected tech in the list.
 */
const handleMobileSelect = async (tech: string, index: number) => {
  if (!uiStore.isMobile || props.viewMode !== VIEW_HERO) {
    // Desktop or already in sidebar: just emit
    emit('select', tech);
    return;
  }

  // Fade out all Hero buttons
  const allButtons = buttonRefs.value;
  await gsap.to(allButtons, {
    opacity: 0,
    y: -20,
    duration: 0.3,
    stagger: 0.03,
    ease: EASE_POWER2_IN,
  });

  // Emit select to trigger viewMode change to sidebar
  emit('select', tech);

  // Animate rectangles sliding up
  await nextTick();
  if (downbarRectsRef.value) {
    const rects = downbarRectsRef.value.querySelectorAll('button');
    gsap.fromTo(rects, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: EASE_POWER2_OUT }
    );
  }
};

// Inicial setup cuando el componente se monta
onMounted(() => {
  // Inicializa el indicador como invisible
  if (indicatorRef.value) {
    gsap.set(indicatorRef.value, {
      opacity: 0,
      scaleY: 0,
    });
  }
});
</script>

<template>
  <div>
    <!-- [DESKTOP/MOBILE HERO] :: STANDARD LIST -->
    <nav
      v-if="!uiStore.isMobile || viewMode === VIEW_HERO"
      ref="menuRef"
      class="flex flex-col relative"
      :class="[
        viewMode === 'hero'
          ? 'items-center justify-center gap-6'
          : 'items-start justify-start gap-4 mt-0 pl-6',
      ]"
    >
      <!-- Indicador flotante - estilo brutalista (rectangular) -->
      <span
        ref="indicatorRef"
        class="absolute left-0 w-1 h-8 bg-accent origin-center"
        :class="viewMode === VIEW_SIDEBAR ? 'block' : 'hidden'"
        style="top: 0"
      ></span>

      <button
        v-for="(tech, index) in technologies"
        :key="tech"
        :ref="(el) => setButtonRef(el as HTMLElement, index)"
        @click="handleMobileSelect(tech, index)"
        class="tech-btn relative group flex items-center origin-left transition-colors duration-300 cursor-crosshair"
        :class="[
          viewMode === VIEW_HERO
            ? 'font-sans font-black uppercase text-6xl md:text-8xl tracking-tighter text-dark hover:text-accent ' 
            : 'font-sans text-2xl text-left ',
          viewMode === VIEW_SIDEBAR && activeTech === tech
            ? 'text-dark'
            : viewMode === VIEW_SIDEBAR
            ? 'text-gray-400 hover:text-dark'
            : '',
        ]"
      >
        {{ tech }}
      </button>
    </nav>

    <!-- [MOBILE SIDEBAR] :: DOWNBAR -->
    <div 
      v-if="uiStore.isMobile && viewMode === VIEW_SIDEBAR"
      class="fixed bottom-0 left-0 w-full bg-light p-4 pb-6 z-50 flex flex-col gap-4"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- Active Tech Title -->
      <div class="text-center">
        <h2 class="font-sans font-black text-3xl uppercase tracking-tighter text-dark leading-none">
          {{ activeTech }}
        </h2>
      </div>

      <!-- Navigation Rectangles -->
      <div ref="downbarRectsRef" class="flex items-end justify-between gap-1 w-full px-4 h-3">
        <button
          v-for="tech in technologies"
          :key="tech"
          @click="emit('select', tech)"
          class="flex-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          :class="[
            activeTech === tech 
              ? 'bg-accent h-full' 
              : 'bg-dark h-1.5'
          ]"
          :aria-label="tech"
        ></button>
      </div>
    </div>
  </div>
</template>
