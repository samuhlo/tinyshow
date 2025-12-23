<script setup lang="ts">
/**
 * [COMPONENT] :: MOBILE_LAYOUT
 * ----------------------------------------------------------------------
 * Layout específico para la versión móvil.
 * Estructura simplificada para pantallas pequeñas con animación de intro.
 *
 * @module    components/layout/MobileLayout
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import gsap from 'gsap';
import AppLogo from '~/components/ui/AppLogo.vue';
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue';
import LangSwitcher from '~/components/ui/LangSwitcher.vue';
import ThemeSwitcher from '~/components/ui/ThemeSwitcher.vue';
import { useUiStore } from '~/stores/useUiStore';

// =====================================================================
// [SECTION] :: STATE
// =====================================================================

const uiStore = useUiStore();
const introPhase = ref<'loading' | 'logo' | 'complete'>('loading');
const headerLogoRef = ref<HTMLElement | null>(null);
const centerLogoRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);

// =====================================================================
// [SECTION] :: ANIMATION SEQUENCE
// =====================================================================

// Reiniciar estado de animación para que el efecto Slot Machine corra siempre al montar
if (import.meta.client) {
  uiStore.setLogoAnimated(false);
}

onMounted(() => {
  // 1. Fase de Carga
  setTimeout(() => {
    // Desvanecer spinner
    gsap.to('.intro-spinner', {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        // Asegurar estado estrictamente fresco para la animación
        uiStore.setLogoAnimated(false);
        uiStore.setAppMounted(true); // Asegurar que está listo
        
        introPhase.value = 'logo'; // Esto ACTIVARÁ el montaje debido al v-if
        
        nextTick().then(() => {
          animateLogoEntry();
        });
      }
    });
  }, 0); // Espera de carga inicial
});

const animateLogoEntry = () => {
  const tl = gsap.timeline();
  
  // 2. Revelado de Logo (Centro) - Ligeramente más pequeño (1.5)
  tl.fromTo('.intro-logo', 
    { scale: 0.8, opacity: 0 },
    { scale: 1.5, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
  )
  // 3. Esperar al Slot Machine
  // [AJUSTE] Cambiar duración aquí para controlar cuánto espera antes de moverse
  .to({}, { duration: 0.1 }) 
  
  // 4. Mover al Header
  .call(() => {
    moveLogoToHeader();
  });
};

const moveLogoToHeader = () => {
  if (!centerLogoRef.value || !headerLogoRef.value) return;

  // FLIP Manual - Alinear Centros
  const startState = centerLogoRef.value.getBoundingClientRect();
  const endState = headerLogoRef.value.getBoundingClientRect();

  // Calcular puntos centrales
  const startCenterX = startState.left + startState.width / 2;
  const startCenterY = startState.top + startState.height / 2;
  
  const endCenterX = endState.left + endState.width / 2;
  const endCenterY = endState.top + endState.height / 2;

  // Calcular delta basado en centros
  const x = endCenterX - startCenterX;
  const y = endCenterY - startCenterY;
  
  gsap.to('.intro-logo', {
    x: x,
    y: y,
    scale: 1, 
    duration: 1.2,
    ease: "power3.inOut",
    onComplete: () => {
      introPhase.value = 'complete';
      revealContent();
    }
  });
};

const revealContent = () => {
  // Revelar Selector de Idioma y Contenido Principal
  // El borde del header permanece transparente según lo solicitado
  
  gsap.fromTo([contentRef.value, '.header-actions'],
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }
  );
};
</script>

<template>
  <div class="h-dvh bg-light text-dark font-mono relative flex flex-col overflow-hidden">
    
    <!-- [OVERLAY] :: SPINNER DE INTRODUCCIÓN Y LOGO -->
    <div v-if="introPhase !== 'complete'" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-light">
      
      <!-- Spinner -->
      <div v-if="introPhase === 'loading'" class="intro-spinner flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" color="dark" />
      </div>

      <!-- Logo Central (El que se mueve) -->
      <div 
        ref="centerLogoRef"
        v-if="introPhase === 'logo'"
        class="intro-logo absolute"
      >
        <AppLogo :key="introPhase" /> 
      </div>
    </div>

    <!-- [LAYOUT] :: CABECERA -->
    <header 
      ref="headerRef"
      class="p-4 pb-0 border-b border-transparent transition-colors duration-500 relative z-40 shrink-0"
    >
      <div class="flex items-center justify-between min-h-12"> <!-- min-h asegura altura consistente -->
         <!-- Marcador del Logo en Header (Destino Final) -->
         <div ref="headerLogoRef" class="opacity-0" :class="{ 'opacity-100': introPhase === 'complete' }">
           <AppLogo />
         </div>

         <!-- Selector de Idioma + Theme -->
         <div class="header-actions opacity-0 flex flex-col items-end gap-1">
           <ThemeSwitcher />
           <LangSwitcher />
         </div>
      </div>
    </header>

    <!-- [LAYOUT] :: CONTENIDO -->
    <main 
      ref="contentRef"
      class="w-full flex-1 min-h-0 p-4 pt-0 opacity-0 overflow-hidden"
    >
      <slot />
    </main>
    
    <!-- [LAYOUT] :: BARRA INFERIOR (Futuro) o Footer Oculto -->
    <!-- Footer eliminado según solicitud -->
  </div>
</template>
