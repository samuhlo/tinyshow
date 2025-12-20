<script setup lang="ts">
/**
 * [PAGE] :: ERROR
 * ----------------------------------------------------------------------
 * Página de error personalizada (404, 500, etc).
 * Diseño minimalista y brutalista alineado con la identidad visual.
 *
 * @module    app/error
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import type { NuxtError } from '#app'
import gsap from 'gsap'
import AppLogo from '~/components/ui/AppLogo.vue'
import LangSwitcher from '~/components/ui/LangSwitcher.vue'

// =====================================================================
// [SECTION] :: PROPS & STATE
// =====================================================================

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })

// =====================================================================
// [SECTION] :: ANIMATIONS
// =====================================================================

const containerRef = ref<HTMLElement | null>(null)
const codeRef = ref<HTMLElement | null>(null)
const messageRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!containerRef.value) return

  // Set initial state with GSAP (avoids CSS class conflicts)
  gsap.set([codeRef.value, messageRef.value, buttonRef.value], { opacity: 0 })

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' }
  })

  tl.fromTo(codeRef.value, 
    { y: 100, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, delay: 0.2 }
  )
  .fromTo(messageRef.value,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8 },
    '-=0.6'
  )
  .fromTo(buttonRef.value,
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6 },
    '-=0.4'
  )
})
</script>

<template>
  <div ref="containerRef" class="min-h-screen w-full flex flex-col justify-center bg-light text-dark relative overflow-hidden">
    
    <!-- Header (Simplified) -->
    <header class="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50">
      <AppLogo />
      <LangSwitcher />
    </header>
    
    <!-- Main Content -->
    <main class="grow flex flex-col items-center justify-center p-6 relative z-10">
      <div class="text-center max-w-2xl">
        <!-- Error Code -->
        <h1 
          ref="codeRef" 
          class="font-display text-6xl leading-none tracking-tighter text-accent select-none mix-blend-multiply"
        >
          {{ error.statusCode }}
        </h1>

        <!-- Error Message -->
        <div ref="messageRef" class="space-y-6 mb-5">
          <h2 class="font-mono text-xl md:text-2xl uppercase tracking-widest border-y-2 border-dark py-4 inline-block">
            {{ error.message || 'Unknown Error' }}
          </h2>
          
          <p class="font-sans text-lg text-dark/60 max-w-md mx-auto">
            Seems like you've wandered into the void. 
            Don't worry, it's cozy here, but there's no show to watch.
          </p>
        </div>

        <!-- Action Button -->
        <div ref="buttonRef">
          <button 
            @click="handleError"
            class="cursor-pointer relative inline-flex items-center justify-center px-8 py-4 font-mono font-bold text-lg uppercase tracking-wider overflow-hidden "
          >
            Back to Safety
          </button>
        </div>
      </div>
    </main>

    <!-- Footer / Context -->
    <footer class="w-full text-center pb-10 opacity-30 font-mono text-xs uppercase tracking-widest relative z-10">
      TinyShow System // Error Handler
    </footer>

  </div>
</template>
