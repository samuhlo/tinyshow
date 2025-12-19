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
  if (!indicatorRef.value || !props.activeTech || props.viewMode !== "sidebar") return;

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
    duration: 0.5,
    ease: "expo.out",
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
    duration: 0.3,
    ease: "power2.in",
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
        duration: 0.8,
        ease: "expo.out",
        stagger: {
          amount: 0.15,
          from: "start",
        },
        absolute: true,
        onComplete: () => {
          // Anima el indicador después de que los botones estén en su lugar
          if (newMode === "sidebar") {
            setTimeout(animateIndicator, 50);
          }
        },
      })
    );

    // Si cambiamos a hero, oculta el indicador
    if (newMode === "hero") {
      hideIndicator();
    }

    // Animación de entrada para los colores en modo sidebar
    if (newMode === "sidebar") {
      tl.to(
        buttons,
        {
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
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
    if (props.viewMode !== "sidebar" || !newTech) return;

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
      :class="viewMode === 'sidebar' ? 'block' : 'hidden'"
      style="top: 0"
    ></span>

    <button
      v-for="(tech, index) in technologies"
      :key="tech"
      :ref="(el) => setButtonRef(el as HTMLElement, index)"
      @click="emit('select', tech)"
      class="tech-btn relative group flex items-center origin-left transition-colors duration-300 cursor-crosshair"
      :class="[
        viewMode === 'hero'
          ? 'font-sans font-black uppercase text-6xl md:text-8xl tracking-tighter text-dark hover:text-accent ' 
          : 'font-sans text-2xl text-left ',
        viewMode === 'sidebar' && activeTech === tech
          ? 'text-dark'
          : viewMode === 'sidebar'
          ? 'text-gray-400 hover:text-dark'
          : '',
      ]"
    >
      {{ tech }}
    </button>
  </nav>
</template>
