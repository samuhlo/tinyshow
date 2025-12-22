/**
 * [STORE] :: USE_SHOWCASE_STORE
 * ----------------------------------------------------------------------
 * Store centralizado de Pinia para gestionar el estado global del Showcase.
 * Controla el modo de vista, la tecnología activa, el proyecto expandido
 * y el estado de animación para prevenir race conditions.
 *
 * Diseñado para ser extensible hacia la futura versión móvil (deck, gestos).
 *
 * @module    composables/stores
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { defineStore } from "pinia";
import type { Project } from "~~/shared/types";

// =====================================================================
// [SECTION] :: TYPE DEFINITIONS
// =====================================================================

/** Modos de visualización del layout principal */
type ViewMode = "hero" | "sidebar";

/** Estado del store */
interface ShowcaseState {
  viewMode: ViewMode;
  activeTech: string | null;
  expandedProject: Project | null;
  expandedImageRect: DOMRect | null;
  isAnimating: boolean;
  isIntroAnimating: boolean;
}

// =====================================================================
// [SECTION] :: STORE DEFINITION
// =====================================================================

export const useShowcaseStore = defineStore("showcase", {
  // -------------------------------------------------------------------
  // [STATE] :: REACTIVE DATA
  // -------------------------------------------------------------------
  state: (): ShowcaseState => ({
    /** Layout actual de la página (hero | sidebar) */
    viewMode: "hero",

    /** Tecnología actualmente seleccionada por el usuario */
    activeTech: null,

    /** Proyecto con detalle expandido (null si ninguno) */
    expandedProject: null,

    /** Rect de la imagen para animación FLIP */
    expandedImageRect: null,

    /** Lock global para prevenir race conditions durante animaciones */
    isAnimating: false,

    /** Estado de la animación de introducción en móvil */
    isIntroAnimating: true,
  }),

  // -------------------------------------------------------------------
  // [GETTERS] :: COMPUTED STATE
  // -------------------------------------------------------------------
  getters: {
    /**
     * [GET] :: IS_HERO_MODE
     * Indica si estamos en modo Hero (landing).
     */
    isHeroMode: (state): boolean => state.viewMode === "hero",

    /**
     * [GET] :: IS_SIDEBAR_MODE
     * Indica si estamos en modo Sidebar (navegación).
     */
    isSidebarMode: (state): boolean => state.viewMode === "sidebar",

    /**
     * [GET] :: HAS_EXPANDED_PROJECT
     * Indica si hay un proyecto con detalle abierto.
     */
    hasExpandedProject: (state): boolean => state.expandedProject !== null,
  },

  // -------------------------------------------------------------------
  // [ACTIONS] :: STATE MUTATIONS
  // -------------------------------------------------------------------
  actions: {
    /**
     * [ACTION] :: SELECT_TECH
     * Procesa la selección de una tecnología.
     * Transiciona de 'hero' a 'sidebar' automáticamente.
     *
     * @param tech - Nombre de la tecnología seleccionada.
     */
    selectTech(tech: string): void {
      // Cerrar cualquier proyecto expandido al cambiar de tech
      if (this.expandedProject) {
        this.collapseProject();
      }

      this.activeTech = tech;

      if (this.viewMode === "hero") {
        this.viewMode = "sidebar";
      }
    },

    /**
     * [ACTION] :: EXPAND_PROJECT
     * Abre el detalle de un proyecto con datos para animación FLIP.
     *
     * @param project   - Proyecto a expandir.
     * @param imageRect - (Optional) Rect de la imagen para FLIP.
     */
    expandProject(project: Project, imageRect: DOMRect | null = null): void {
      // Si es el mismo proyecto, toggle (cerrar)
      if (this.expandedProject?.id === project.id) {
        this.collapseProject();
        return;
      }

      this.expandedProject = project;
      this.expandedImageRect = imageRect;
    },

    /**
     * [ACTION] :: COLLAPSE_PROJECT
     * Cierra el detalle del proyecto actual.
     */
    collapseProject(): void {
      this.expandedProject = null;
      this.expandedImageRect = null;
    },

    /**
     * [ACTION] :: SET_ANIMATING
     * Establece el lock de animación global.
     *
     * @param value - Estado del lock (true = bloqueado).
     */
    setAnimating(value: boolean): void {
      this.isAnimating = value;
    },

    /**
     * [ACTION] :: SET_INTRO_ANIMATING
     * Controla el estado de la animación de introducción móvil.
     *
     * @param value - true si la intro está en curso.
     */
    setIntroAnimating(value: boolean): void {
      this.isIntroAnimating = value;
    },

    /**
     * [ACTION] :: RESET_TO_HERO
     * Reinicia el store al estado inicial (Hero mode).
     * Útil para navegación móvil o reset manual.
     */
    resetToHero(): void {
      this.viewMode = "hero";
      this.activeTech = null;
      this.expandedProject = null;
      this.expandedImageRect = null;
      this.isAnimating = false;
    },

    // -----------------------------------------------------------------
    // [FUTURE] :: MOBILE DECK ACTIONS
    // -----------------------------------------------------------------
    // Los siguientes métodos se implementarán cuando se añada el móvil:
    //
    // nextProject(): void { ... }
    // prevProject(): void { ... }
    // setCurrentProjectIndex(index: number): void { ... }
    // setScrollDirection(direction: 'up' | 'down'): void { ... }
  },
});
