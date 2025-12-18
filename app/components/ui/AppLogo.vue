/**
 * [COMPONENT] :: APP_LOGO
 * ----------------------------------------------------------------------
 * Logo animado con efecto "Slot Machine" para la marca TINYSH{ X }W.
 * 
 * Renderiza un icono aleatorio de la fuente Bariol Icons con una animación
 * vertical tipo tragaperras. En cada carga de página, selecciona un carácter
 * random y lo revela mediante un strip animado que simula el giro de rodillos.
 *
 * @module    components/ui
 * @uses      Bariol Icons (font local)
 * ----------------------------------------------------------------------
 */

<script setup lang="ts">
/**
 * [CONST] :: SLOT_CONFIG
 * Configuración del strip de iconos para la animación.
 *
 * @const {String}  chars       - Alfabeto disponible (mapeado a glifos Bariol).
 * @const {Number}  SLOT_HEIGHT - Altura fija de cada celda del strip (px).
 * @const {Number}  REEL_LENGTH - Cantidad de iconos random en el carrete.
 */
const chars       = 'abcdefghijklmnopqrstuvwxyz';
const SLOT_HEIGHT = 50;
const REEL_LENGTH = 10;

/**
 * [STATE] :: REACTIVE_REFS
 * Estado reactivo del componente.
 *
 * @ref {String[]} strip   - Array ordenado: [buffer, target, ...randoms].
 * @ref {Boolean}  mounted - Flag que dispara la animación post-mount.
 */
const strip   = ref<string[]>([]);
const mounted = ref(false);

/**
 * [UTIL] :: GET_RANDOM_CHAR
 * Extrae un carácter aleatorio del alfabeto disponible.
 *
 * @returns {String} - Carácter único (a-z) para renderizar como icono.
 */
const getRandomChar = (): string => chars[Math.floor(Math.random() * chars.length)]!;

/**
 * [LIFECYCLE] :: ON_MOUNTED
 * Inicializa el strip y dispara la animación del slot.
 *
 * ESTRUCTURA DEL STRIP:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Index 0   │  Index 1   │  Index 2..N                              │
 * │  [BUFFER]  │  [TARGET]  │  [...RANDOMS]                            │
 * │  (oculto)  │  (destino) │  (carrete visible durante animación)     │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * FLUJO DE ANIMACIÓN:
 * 1. Estado inicial: translateY posiciona el último random visible.
 * 2. Transición: El strip se desplaza hacia abajo (translateY aumenta).
 * 3. Estado final: translateY(-SLOT_HEIGHT) muestra el TARGET (index 1).
 *
 * El BUFFER (index 0) existe para el efecto "bounce" del easing que
 * puede sobrepasar momentáneamente la posición final.
 */
onMounted(() => {
  const target  = getRandomChar();
  const buffer  = getRandomChar();
  const randoms = Array.from({ length: REEL_LENGTH }, () => getRandomChar());

  strip.value = [buffer, target, ...randoms];

  // Dispara animación en el siguiente frame para asegurar render del DOM
  requestAnimationFrame(() => {
    mounted.value = true;
  });
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
        class="flex flex-col absolute top-0 left-0 w-full text-center transition-transform duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        :style="{ 
          transform: mounted 
            ? `translateY(-${SLOT_HEIGHT}px)` 
            : `translateY(-${SLOT_HEIGHT * (strip.length - 1)}px)`,
          fontFamily: '\'Bariol Icons\', sans-serif'
        }"
      >
        <!-- [SLOT] :: ICON_CELL
             Cada celda tiene altura fija = SLOT_HEIGHT para cálculos precisos.
             El carácter se renderiza como glifo de Bariol Icons. -->
        <span 
          v-for="(char, i) in strip" 
          :key="i"
          class="h-12 w-auto flex items-center justify-center leading-none text-accent"
        >
          {{ char }}
        </span>
      </div>
    </div>

    <span class="tracking-widest">}W</span>
  </div>
</template>

<style scoped>
/**
 * [STYLES] :: SCOPED_OVERRIDES
 * La fuente Bariol Icons se aplica via inline style en el strip.
 * Los estilos scoped están vacíos pero reservados para futuras extensiones.
 */
</style>

