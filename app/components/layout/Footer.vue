<script setup lang="ts">
/**
 * [LAYOUT] :: FOOTER
 * ----------------------------------------------------------------------
 * Footer minimalista de la aplicación.
 * Muestra créditos de autor y enlace de contacto con animación bounce.
 *
 * @module    components/layout/Footer
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { gsap } from "gsap";

// =====================================================================
// [SECTION] :: REFS
// =====================================================================

/** Referencia al enlace de contacto para animaciones GSAP. */
const contactRef = ref<HTMLAnchorElement | null>(null);

/** Timeline de la animación bounce. */
let bounceTimeline: gsap.core.Timeline | null = null;

// =====================================================================
// [SECTION] :: HANDLERS
// =====================================================================

/**
 * Pausa la animación y aplica estilo hover.
 */
const handleMouseEnter = () => {
  if (!contactRef.value) return;
  
  bounceTimeline?.pause();
  gsap.to(contactRef.value, {
    fontWeight: 700,
    y: 0,
    duration: 0.2,
    ease: "power2.out",
  });
};

/**
 * Reanuda la animación y restaura estilo base.
 */
const handleMouseLeave = () => {
  if (!contactRef.value) return;
  
  gsap.to(contactRef.value, {
    color: "#141414",
    fontWeight: 400,
    duration: 0.2,
    ease: "power2.out",
    onComplete: () => { bounceTimeline?.resume(); },
  });
};

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

onMounted(() => {
  if (!contactRef.value) return;

  const el = contactRef.value;

  // Asegurar estado inicial
  gsap.set(el, { y: 0, color: "#141414", fontWeight: 400 });

  // Timeline con animación bounce fluida y periódica
  bounceTimeline = gsap.timeline({ repeat: -1, repeatDelay: 5 })
    // Subida suave con cambio a accent + bold
    .to(el, {
      y: -20,
      color: "#f95c4b",
      fontWeight: 800,
      duration: 0.6,
      ease: "sine.out",
    })
    // Pequeña pausa arriba
    .to(el, {
      y: -20,
      duration: 0.1,
    })
    // Bajada suave con rebote natural
    .to(el, {
      y: 0,
      duration: 0.8,
      ease: "bounce.out",
    })
    // Volver al color dark y peso normal
    .to(el, {
      color: "#141414",
      fontWeight: 400,
      duration: 0.5,
      ease: "sine.inOut",
    }, "-=0.3");
});
</script>

<template>
  <footer class="w-full py-6 px-6 md:px-10 flex items-center justify-between text-xs text-dark/60 font-mono">
    <span>
      created by 
      <a 
        href="https://github.com/samuhlo" 
        target="_blank" 
        rel="noopener noreferrer"
        class="group inline-block"
      >
        <span class="relative">
          <strong class="text-dark">samuhlo</strong>
          <span class="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-accent transition-all duration-300 ease-out group-hover:w-full" />
        </span>
      </a>
    </span>
    <a
      ref="contactRef"
      href="mailto:hola@samuhlo.dev"
      class="group text-dark cursor-pointer"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <span class="relative">
        contact
        <span 
          ref="underlineRef"
          class="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-accent transition-all duration-300 ease-out group-hover:w-full" 
        />
      </span>
    </a>
  </footer>
</template>

