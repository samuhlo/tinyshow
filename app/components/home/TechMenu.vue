<script setup lang="ts">
/**
 * [COMPONENT] :: TECH_MENU
 * ----------------------------------------------------------------------
 * Menú de navegación principal basado en tecnologías.
 * Implementa animaciones FLIP para transicionar entre estados Hero y Sidebar.
 *
 * @module    components/home
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

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
// [SECTION] :: STORES
// =====================================================================

import { storeToRefs } from "pinia";
import { useShowcaseStore } from "~/composables/stores/useShowcaseStore";
import { useDataStore } from "~/composables/stores/useDataStore";

/**
 * [STORE] :: SHOWCASE_STORE
 * Accede al estado centralizado para viewMode y activeTech.
 */
const showcaseStore = useShowcaseStore();
const { viewMode, activeTech } = storeToRefs(showcaseStore);

/**
 * [STORE] :: DATA_STORE
 * Accede a las tecnologías cacheadas.
 */
const dataStore = useDataStore();
const { technologies } = storeToRefs(dataStore);

// =====================================================================
// [SECTION] :: COMPONENT REFS
// =====================================================================

const menuRef = ref<HTMLElement | null>(null);
const indicatorRef = ref<HTMLElement | null>(null);
const buttonRefs = ref<HTMLElement[]>([]);

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
 * Desplaza el indicador visual hacia el botón de la tecnología activa.
 */
const animateIndicator = () => {
  if (!indicatorRef.value || !activeTech.value || viewMode.value !== VIEW_SIDEBAR) return;

  const activeIndex = technologies.value.indexOf(activeTech.value);
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
  viewMode,
  async (newMode, oldMode) => {
    if (!menuRef.value) return;

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
  activeTech,
  async (newTech, oldTech) => {
    if (viewMode.value !== VIEW_SIDEBAR || !newTech) return;

    await nextTick();
    animateIndicator();
  }
);

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
  <nav
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
      @click="showcaseStore.selectTech(tech)"
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
</template>
