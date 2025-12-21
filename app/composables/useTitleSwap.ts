/**
 * [COMPOSABLE] :: USE_TITLE_SWAP
 * ----------------------------------------------------------------------
 * Cambia el título de la pestaña cuando el usuario abandona la ventana
 * y lo restaura al volver.
 *
 * @module    composables/useTitleSwap
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

/**
 * [COMPOSABLE] :: useTitleSwap
 * Gestiona el intercambio dinámico del título de la pestaña del navegador.
 *
 * @param swapTitle - Título a mostrar cuando la pestaña pierde el foco.
 */
export function useTitleSwap(swapTitle: string = "Show must go ON !!!") {
  // =====================================================================
  // [SECTION] :: STATE
  // =====================================================================

  /** Título original capturado una sola vez al inicializar. */
  let originalTitle = "";
  /** Flag para evitar capturar el título swap como original. */
  let isTitleSwapped = false;

  // =====================================================================
  // [SECTION] :: HANDLERS
  // =====================================================================

  const handleBlur = () => {
    // Solo capturar el título original si no está ya swapeado
    if (!isTitleSwapped) {
      originalTitle = document.title;
      document.title = swapTitle;
      isTitleSwapped = true;
    }
  };

  const handleFocus = () => {
    if (isTitleSwapped && originalTitle) {
      document.title = originalTitle;
      isTitleSwapped = false;
    }
  };

  // =====================================================================
  // [SECTION] :: LIFECYCLE
  // =====================================================================

  onMounted(() => {
    // Capturar el título inicial al montar
    originalTitle = document.title;
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
  });

  onUnmounted(() => {
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("focus", handleFocus);
  });
}
