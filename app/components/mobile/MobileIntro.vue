<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_INTRO
 * ----------------------------------------------------------------------
 * Secuencia de introducción "Triunfal" para dispositivos móviles.
 * 
 * 1. Pantalla blanca + Spinner (mientras carga data)
 * 2. Aparece Logo centrado -> Animación Slot
 * 3. Logo flota hasta su posición en el Header
 * 4. Desaparece el overlay y revela la UI
 *
 * @module    components/mobile
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";
import { useDataStore } from "~/composables/stores/useDataStore";
import { useShowcaseStore } from "~/composables/stores/useShowcaseStore";
import AppLogo from "~/components/ui/AppLogo.vue";

// =====================================================================
// [SECTION] :: STORES & STATE
// =====================================================================

const dataStore = useDataStore();
const showcaseStore = useShowcaseStore();

const logoRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

/**
 * Stages:
 * - loading: Spinner visible, data fetching
 * - presenting: Spinner gone, Logo visible & animating (slot)
 * - moving: Logo moving to header
 * - finished: Done, waiting to unmount
 */
type IntroStage = 'loading' | 'presenting' | 'moving' | 'finished';
const stage = ref<IntroStage>('loading');

// =====================================================================
// [SECTION] :: ANIMATION LOGIC
// =====================================================================

/**
 * Ejecuta la transición de movimiento del logo hacia el header.
 */
const animateToHeader = () => {
  if (!logoRef.value) return;

  // Localizar el destino (Logo en el Header oculto)
  const target = document.getElementById("header-logo");
  if (!target) {
    console.warn("[MobileIntro] Header logo target not found. Skipping animation.");
    finishIntro();
    return;
  }

  // [CRITICAL] :: MEASURE_AT_SCALE_1
  // Para calcular 'x' y 'y' correctamente, necesitamos las coordenadas SIN la transformación de escala.
  // Si medimos con scale=1.25, el 'left' visual es menor (más a la izquierda), lo que genera un deltaX mayor,
  // causando que el logo "se pase" a la derecha y luego salte.
  
  // 1. Reset scale temporalmente
  gsap.set(logoRef.value, { scale: 1 });

  // 2. Medir
  const startRect = logoRef.value.getBoundingClientRect();
  const endRect = target.getBoundingClientRect();

  // 3. Restaurar scale para la animación visual
  gsap.set(logoRef.value, { scale: 1.25 });

  const x = endRect.left - startRect.left;
  const y = endRect.top - startRect.top;



  // Animación GSAP
  stage.value = 'moving';
  
  const tl = gsap.timeline({
    onComplete: finishIntro
  });

  // 1. Mover el logo a la posición del header
  tl.to(logoRef.value, {
    x: x,
    y: y,
    scale: 1,
    duration: 1.0,
    ease: "power4.inOut"
  });

  // 2. Fade out del fondo blanco (antes de terminar el movimiento para suavidad)
  tl.to(containerRef.value, {
    backgroundColor: "transparent",
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.4");
};

/**
 * Finaliza la intro y actualiza el store global.
 */
const finishIntro = () => {
  stage.value = 'finished';
  showcaseStore.setIntroAnimating(false);
};

/**
 * Inicia la secuencia una vez cargados los datos.
 */
const startSequence = () => {
  // Pequeño delay para asegurar transición suave del spinner
  setTimeout(() => {
    stage.value = 'presenting';

    // Set initial scale immediately after render
    nextTick(() => {
      if (logoRef.value) {
        gsap.set(logoRef.value, { scale: 1.25 });
      }
    });

    // Tiempo para que la animación del Slot Machine (AppLogo) termine visualmente.
    // AppLogo tarda ~1000ms. Reducimos el delay para que sea más ágil.
    setTimeout(() => {
      requestAnimationFrame(animateToHeader);
    }, 1200);
  }, 300);
};

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================



/**
 * [COMPUTED] :: IS_READY
 * Determina si la carga inicial de datos ha completado realmente.
 * Evita falsos positivos cuando el store inicializa con loading=false pero sin datos.
 */
const isReady = computed(() => {
  const hasData = dataStore.technologies.length > 0;
  const hasError = !!dataStore.technologiesError;
  const hasFetched = !!dataStore.lastTechFetch;
  
  // Estamos listos si NO está cargando Y (tenemos datos O error O ya se intentó fetch)
  return !dataStore.technologiesLoading && (hasData || hasError || hasFetched);
});

watch(
  isReady,
  (ready) => {
    if (ready && stage.value === 'loading') {
      startSequence();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div 
    ref="containerRef"
    class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-light transition-colors"
    :class="{ 'pointer-events-none': stage === 'finished' || stage === 'moving' }"
  >
    <!-- Spinner: Visible only during loading stage -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-500"
      leave-to-class="opacity-0"
    >
      <div v-if="stage === 'loading'" class="absolute inset-0 flex items-center justify-center">
        <UiLoadingSpinner size="lg" color="dark" />
      </div>
    </Transition>

    <!-- Logo: Visible after loading -->
    <Transition
      enter-active-class="transition-opacity duration-700 ease-out"
      enter-from-class="opacity-0"
    >
      <div 
        v-if="stage !== 'loading'"
        ref="logoRef"
        class="relative z-10"
      >
      <!-- Logo wrapper -->
      <div>
        <AppLogo :force-animation="true" />
      </div>
      </div>
    </Transition>
  </div>
</template>
