/**
 * [STORE] :: UI_STORE
 * ----------------------------------------------------------------------
 * Global store for managing UI state and view modes.
 * Handles the separation between Desktop and Mobile logic.
 *
 * @module    stores/ui
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

export const useUiStore = defineStore("ui", () => {
  // [ESTADO]
  const isMobile = ref(false);
  const viewMode = ref<"desktop" | "mobile">("desktop");
  const isAppMounted = ref(false);

  // Persistencia de estado del logo
  const logoState = reactive({
    hasAnimated: false,
    activeChar: "",
  });

  // [ACCIONES]
  const checkDevice = () => {
    // Verificación móvil básica usando ancho de ventana
    // Breakpoint 'md' de Tailwind es 768px
    if (import.meta.client) {
      isMobile.value = window.innerWidth < 768;
      viewMode.value = isMobile.value ? "mobile" : "desktop";
    }
  };

  const setAppMounted = (value: boolean) => {
    isAppMounted.value = value;
  };

  const setLogoAnimated = (value: boolean) => {
    logoState.hasAnimated = value;
  };

  const setLogoChar = (char: string) => {
    logoState.activeChar = char;
  };

  // [INICIO]
  // Inicializar verificación de dispositivo si está en cliente
  if (import.meta.client) {
    checkDevice();
    // Opcional: Agregar listener de resize aquí o en app.vue
    window.addEventListener("resize", checkDevice);
  }

  return {
    isMobile,
    viewMode,
    isAppMounted,
    logoState,
    checkDevice,
    setAppMounted,
    setLogoAnimated,
    setLogoChar,
  };
});
