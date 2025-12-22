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

// Reset animation state so the Slot Machine effect always runs on mount
if (import.meta.client) {
  uiStore.setLogoAnimated(false);
}

onMounted(() => {
  // 1. Loading Phase
  setTimeout(() => {
    // Fade out spinner
    gsap.to('.intro-spinner', {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        // Ensure strictly fresh state for the animation
        uiStore.setLogoAnimated(false);
        uiStore.setAppMounted(true); // Ensure it's ready to go
        
        introPhase.value = 'logo'; // This will now TRIGGER mount due to v-if
        
        nextTick().then(() => {
          animateLogoEntry();
        });
      }
    });
  }, 1000); // Initial load wait
});

const animateLogoEntry = () => {
  const tl = gsap.timeline();
  
  // 2. Logo Reveal (Center) - Slightly smaller (1.5)
  tl.fromTo('.intro-logo', 
    { scale: 0.8, opacity: 0 },
    { scale: 1.5, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
  )
  // 3. Wait for Slot Machine (1.5s)
  .to({}, { duration: 1.5 }) 
  
  // 4. Move to Header
  .call(() => {
    moveLogoToHeader();
  });
};

const moveLogoToHeader = () => {
  if (!centerLogoRef.value || !headerLogoRef.value) return;

  // Manual FLIP - Align Centers
  const startState = centerLogoRef.value.getBoundingClientRect();
  const endState = headerLogoRef.value.getBoundingClientRect();

  // Calculate center points
  const startCenterX = startState.left + startState.width / 2;
  const startCenterY = startState.top + startState.height / 2;
  
  const endCenterX = endState.left + endState.width / 2;
  const endCenterY = endState.top + endState.height / 2;

  // Calculate delta based on centers
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
  // Reveal Language Selector and Main Content
  // Header border remains transparent as requested
  
  gsap.fromTo([contentRef.value, '.header-actions'],
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }
  );
};
</script>

<template>
  <div class="min-h-screen bg-light text-dark font-mono relative flex flex-col overflow-hidden">
    
    <!-- [OVERLAY] :: INTRO SPINNER & LOGO -->
    <div v-if="introPhase !== 'complete'" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-light">
      
      <!-- Spinner -->
      <div v-if="introPhase === 'loading'" class="intro-spinner flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" color="dark" />
      </div>

      <!-- Center Logo (The one that moves) -->
      <div 
        ref="centerLogoRef"
        v-if="introPhase === 'logo'"
        class="intro-logo absolute"
      >
        <AppLogo :key="introPhase" /> 
      </div>
    </div>

    <!-- [LAYOUT] :: HEADER -->
    <header 
      ref="headerRef"
      class="p-4 border-b border-transparent transition-colors duration-500 relative z-40"
    >
      <div class="flex items-center justify-between min-h-[48px]"> <!-- min-h ensures consistent height -->
         <!-- Header Logo Placeholder (Final Destination) -->
         <div ref="headerLogoRef" class="opacity-0" :class="{ 'opacity-100': introPhase === 'complete' }">
           <AppLogo />
         </div>

         <!-- Language Selector -->
         <div class="header-actions opacity-0">
           <LangSwitcher />
         </div>
      </div>
    </header>

    <!-- [LAYOUT] :: CONTENT -->
    <main 
      ref="contentRef"
      class="w-full flex-1 p-4 opacity-0"
    >
      <slot />
    </main>
    
    <!-- [LAYOUT] :: DOWNBAR (Future) or Hidden Footer -->
    <!-- Footer removed as requested -->
  </div>
</template>
