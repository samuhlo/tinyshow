/**
 * [COMPONENT] :: APP_LOGO
 * ----------------------------------------------------------------------
 * Logo animado con efecto "Slot Machine" para la marca TINYSH{ X }W.
 * Selecciona un carácter aleatorio de la fuente Bariol Icons con una
 * animación vertical tipo tragaperras.
 *
 * @module    components/ui
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

<script setup lang="ts">
// =====================================================================
// [SECTION] :: CONFIGURATION
// =====================================================================

const CHARS_ALPHABET = "abcdefghijklmnoprstuvwxyz.,?/;:-=1234567890_+";
const SLOT_HEIGHT = 50;
const REEL_LENGTH = 10;
const ANIMATION_DURATION_MS = 1000;
const FONT_FAMILY_ICONS = "'Bariol Icons', sans-serif";
const EASING_CUBIC = "cubic-bezier(0.34,1.56,0.64,1)";


// =====================================================================
// [SECTION] :: COMPONENT STATE
// =====================================================================

const uiStore = useUiStore();
const strip = ref<string[]>([]);
const mounted = ref(false);

// Usa el estado del store para persistencia
const hasAnimated = computed(() => uiStore.logoState.hasAnimated);
const activeChar = computed(() => uiStore.logoState.activeChar);

// =====================================================================
// [SECTION] :: LOGIC UTILS
// =====================================================================

/**
 * [UTIL] :: GET_RANDOM_CHAR
 * Extrae un carácter aleatorio del alfabeto disponible.
 * @returns Carácter único para renderizar como icono.
 */
const getRandomChar = (): string => CHARS_ALPHABET[Math.floor(Math.random() * CHARS_ALPHABET.length)]!;

// =====================================================================
// [SECTION] :: LIFECYCLE
// =====================================================================

const runAnimation = () => {
  mounted.value = true;
  setTimeout(() => {
    uiStore.setLogoAnimated(true);
  }, ANIMATION_DURATION_MS);
};

onMounted(() => {
  if (!activeChar.value) {
    uiStore.setLogoChar(getRandomChar());
  }
  
  const target = activeChar.value;
  const buffer = getRandomChar();

  if (hasAnimated.value) {
    // Omitir animación si ya se reprodujo en esta sesión
    strip.value = [buffer, target];
    mounted.value = true;
  } else {
    // Animación de revelado inicial
    const randoms = Array.from({ length: REEL_LENGTH }, () => getRandomChar());
    strip.value = [buffer, target, ...randoms];

    // Esperar a que la app se monte (splash screen oculto)
    if (uiStore.isAppMounted) {
      requestAnimationFrame(runAnimation);
    } else {
      const unwatch = watch(() => uiStore.isAppMounted, (newVal) => {
        if (newVal) {
          requestAnimationFrame(runAnimation);
          unwatch();
        }
      });
    }
  }
});
</script>

<template>
  <!-- [LAYOUT] :: LOGO_CONTAINER
       Contenedor flex alineado horizontalmente: TINYSH{ [SLOT] }W -->
  <div class="font-display font-black text-xl flex items-center select-none text-dark">
    <span class="tracking-widest">TINYSH{</span>
    
    <!-- [SLOT] :: VIEWPORT
         Ventana visible del carrete. overflow-hidden oculta los iconos fuera del área.
         h-12 (48px) ligeramente mayor que SLOT_HEIGHT para evitar recortes. -->
    <div class="text-3xl h-12 w-10 overflow-hidden relative flex items-center justify-center">
      
      <!-- [SLOT] :: REEL_STRIP
           Tira vertical de iconos que se desplaza con translateY.
           - Inicio: Último random visible (translateY muy negativo).
           - Final: Target visible (translateY = -SLOT_HEIGHT). -->
      <div 
        v-if="strip.length"
        class="flex flex-col absolute top-0 left-0 w-full text-center transition-transform"
        :class="hasAnimated ? 'duration-0' : 'duration-1000'"
        :style="{
          transform: mounted
            ? `translateY(-${SLOT_HEIGHT}px)`
            : `translateY(-${SLOT_HEIGHT * (strip.length - 1)}px)`,
          fontFamily: FONT_FAMILY_ICONS,
          transitionTimingFunction: EASING_CUBIC,
        }"
      >
        <!-- [SLOT] :: ICON_CELL
             Cada celda tiene altura fija = SLOT_HEIGHT para cálculos precisos.
             El carácter se renderiza como glifo de Bariol Icons. -->
        <span 
          v-for="(char, i) in strip" 
          :key="i"
          class="text-4xl h-12 w-auto flex items-center justify-center leading-none text-accent"
        >
          {{ char }}
        </span>
      </div>
    </div>

    <span class="tracking-widest">}W</span>
  </div>
</template>


