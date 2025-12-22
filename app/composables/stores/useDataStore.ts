/**
 * [STORE] :: USE_DATA_STORE
 * ----------------------------------------------------------------------
 * Store centralizado de Pinia para gestionar los datos remotos del Showcase.
 * Cachea las tecnologías y proyectos para evitar re-fetches innecesarios.
 *
 * @module    composables/stores
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { defineStore } from "pinia";
import type { Project } from "~~/shared/types";

// =====================================================================
// [SECTION] :: CONSTANTS & HELPERS
// =====================================================================

const CACHE_DURATION = 3600 * 1000; // 1 hour
let refreshInterval: NodeJS.Timeout | null = null;

// =====================================================================
// [SECTION] :: TYPE DEFINITIONS
// =====================================================================

/** Estado del store de datos */
interface DataState {
  technologies: string[];
  technologiesLoading: boolean;
  technologiesError: string | null;
  lastTechFetch: number | null;

  /** Cache de proyectos por tecnología */
  projectsByTech: Record<string, Project[]>;
  projectsLoading: boolean;
  projectsError: string | null;
  lastProjectsFetch: Record<string, number>;
}

// =====================================================================
// [SECTION] :: STORE DEFINITION
// =====================================================================

export const useDataStore = defineStore("data", {
  // -------------------------------------------------------------------
  // [STATE] :: REACTIVE DATA
  // -------------------------------------------------------------------
  state: (): DataState => ({
    /** Lista de tecnologías disponibles */
    technologies: [],
    technologiesLoading: false,
    technologiesError: null,
    lastTechFetch: null,

    /** Proyectos cacheados por tecnología (key = tech name) */
    projectsByTech: {},
    projectsLoading: false,
    projectsError: null,
    lastProjectsFetch: {},
  }),

  // -------------------------------------------------------------------
  // [GETTERS] :: COMPUTED STATE
  // -------------------------------------------------------------------
  getters: {
    /**
     * [GET] :: HAS_TECHNOLOGIES
     * Indica si ya se cargaron las tecnologías.
     */
    hasTechnologies: (state): boolean => state.technologies.length > 0,

    /**
     * [GET] :: GET_PROJECTS_FOR_TECH
     * Obtiene los proyectos cacheados para una tecnología.
     */
    getProjectsForTech:
      (state) =>
      (tech: string): Project[] | undefined =>
        state.projectsByTech[tech],

    /**
     * [GET] :: HAS_CACHED_PROJECTS
     * Indica si hay proyectos cacheados para una tecnología.
     */
    hasCachedProjects:
      (state) =>
      (tech: string): boolean =>
        !!state.projectsByTech[tech],
  },

  // -------------------------------------------------------------------
  // [ACTIONS] :: DATA FETCHING
  // -------------------------------------------------------------------
  actions: {
    /**
     * [ACTION] :: FETCH_TECHNOLOGIES
     * Carga las tecnologías desde la API.
     * Respeta el TTL del cache a menos que se fuerce.
     *
     * @param force - Forzar recarga ignorando cache y TTL.
     */
    async fetchTechnologies(force: boolean = false): Promise<void> {
      const now = Date.now();
      const isStale =
        !this.lastTechFetch || now - this.lastTechFetch > CACHE_DURATION;

      // Skip if valid cache exists and not forcing
      if (this.technologies.length > 0 && !force && !isStale) {
        return;
      }

      this.technologiesLoading = true;
      this.technologiesError = null;

      try {
        const data = await $fetch<string[]>("/api/projects/techs");
        this.technologies = data || [];
        this.lastTechFetch = now;
      } catch (error) {
        this.technologiesError =
          error instanceof Error
            ? error.message
            : "Error fetching technologies";
        console.error("[DataStore] fetchTechnologies error:", error);
      } finally {
        this.technologiesLoading = false;
      }
    },

    /**
     * [ACTION] :: FETCH_PROJECTS
     * Carga los proyectos para una tecnología.
     * Respeta el TTL del cache a menos que se fuerce.
     *
     * @param tech  - Tecnología a buscar.
     * @param force - Forzar recarga ignorando cache y TTL.
     */
    async fetchProjects(tech: string, force: boolean = false): Promise<void> {
      const now = Date.now();
      const lastFetch = this.lastProjectsFetch[tech];
      const isStale = !lastFetch || now - lastFetch > CACHE_DURATION;

      // Skip if valid cache exists and not forcing
      if (this.projectsByTech[tech] && !force && !isStale) {
        return;
      }

      this.projectsLoading = true;
      this.projectsError = null;

      try {
        const data = await $fetch<Project[]>("/api/projects", {
          query: { primary_tech: tech, limit: 50 },
        });
        this.projectsByTech[tech] = data || [];
        this.lastProjectsFetch[tech] = now;
      } catch (error) {
        this.projectsError =
          error instanceof Error ? error.message : "Error fetching projects";
        console.error("[DataStore] fetchProjects error:", error);
      } finally {
        this.projectsLoading = false;
      }
    },

    /**
     * [ACTION] :: REFRESH_ALL_DATA
     * Refresca silenciosamente todos los datos cargados ignorando el cache.
     * Útil para auto-refresh en background.
     */
    async refreshAllData(): Promise<void> {
      // 1. Refresh Techs
      await this.fetchTechnologies(true);

      // 2. Refresh cached projects (only for techs previously loaded)
      const cachedTechs = Object.keys(this.projectsByTech);
      await Promise.all(
        cachedTechs.map((tech) => this.fetchProjects(tech, true))
      );
    },

    /**
     * [ACTION] :: START_AUTO_REFRESH
     * Inicia el ciclo de refresco automático.
     *
     * @param intervalMs - Intervalo en ms (default: 1 hora).
     */
    startAutoRefresh(intervalMs: number = 3600000): void {
      if (refreshInterval) clearInterval(refreshInterval);

      console.log(
        `[DataStore] Auto-refresh started. Interval: ${intervalMs / 60000}m`
      );

      refreshInterval = setInterval(() => {
        console.log("[DataStore] Triggering auto-refresh...");
        this.refreshAllData();
      }, intervalMs);
    },

    /**
     * [ACTION] :: STOP_AUTO_REFRESH
     * Detiene el ciclo de refresco automático.
     */
    stopAutoRefresh(): void {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log("[DataStore] Auto-refresh stopped.");
      }
    },

    /**
     * [ACTION] :: CLEAR_PROJECTS_CACHE
     * Limpia el cache de proyectos y sus timestamps.
     */
    clearProjectsCache(): void {
      this.projectsByTech = {};
      this.lastProjectsFetch = {};
    },

    /**
     * [ACTION] :: INVALIDATE_TECH_CACHE
     * Elimina el cache de una tech específica.
     */
    invalidateTechCache(tech: string): void {
      delete this.projectsByTech[tech];
      delete this.lastProjectsFetch[tech];
    },
  },
});
