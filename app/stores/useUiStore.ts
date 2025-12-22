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
  // [STATE]
  const isMobile = ref(false);
  const viewMode = ref<"desktop" | "mobile">("desktop");
  const isAppMounted = ref(false);

  // Logo state persistence
  const logoState = reactive({
    hasAnimated: false,
    activeChar: "",
  });

  // [ACTIONS]
  const checkDevice = () => {
    // Basic mobile check using window width
    // Tailwind 'md' breakpoint is 768px
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

  // [INIT]
  // Initialize device check if on client
  if (import.meta.client) {
    checkDevice();
    // Optional: Add resize listener here or in app.vue
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
