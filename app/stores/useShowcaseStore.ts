/**
 * [STORE] :: SHOWCASE_STORE
 * ----------------------------------------------------------------------
 * Core store for the showcase domain.
 * Implements a PREFETCH STRATEGY for optimal performance:
 * - Technologies are loaded on init (blocking).
 * - All projects are prefetched in background (non-blocking).
 * - Project images are preloaded into browser cache.
 * - Tech selection filters locally = instant navigation.
 *
 * @performance Eliminates API calls and image loading delays on navigation.
 * @module      stores/showcase
 * @architect   Samuh Lo
 * ----------------------------------------------------------------------
 */

import type { Project } from "~~/shared/types";

export const useShowcaseStore = defineStore("showcase", () => {
  // =====================================================================
  // [SECTION] :: STATE
  // =====================================================================

  /**
   * [STATE] :: TECHNOLOGIES
   * Available technologies for the main menu.
   * Loaded once on store initialization.
   */
  const technologies = ref<string[]>([]);

  /**
   * [STATE] :: ALL_PROJECTS_CACHE
   * Complete project dataset prefetched in background.
   * Used as the source of truth for local filtering.
   */
  const allProjectsCache = ref<Project[]>([]);

  /**
   * [STATE] :: PROJECTS (Filtered View)
   * Currently visible projects based on active technology.
   * Filtered from `allProjectsCache` for instant updates.
   */
  const projects = ref<Project[]>([]);

  /**
   * [STATE] :: ACTIVE_TECH
   * Currently selected technology filter.
   */
  const activeTech = ref<string | null>(null);

  /**
   * [STATE] :: VIEW_MODE
   * Current layout mode: 'hero' (landing) or 'sidebar' (navigation).
   */
  const viewMode = ref<"hero" | "sidebar">("hero");

  /**
   * [STATE] :: LOADING_FLAGS
   * Track async operations for UI feedback.
   */
  const isTechLoading = ref(false);
  const isProjectsLoading = ref(false);

  /**
   * [STATE] :: LOADED_IMAGES
   * Track which image URLs have been successfully loaded.
   * Prevents showing spinner for images already in browser cache.
   */
  const loadedImages = ref<Set<string>>(new Set());

  // =====================================================================
  // [SECTION] :: INITIALIZATION
  // =====================================================================

  /**
   * [ACTION] :: INIT
   * Initializes the store with a two-phase loading strategy:
   * 1. Await technologies (required for UI rendering).
   * 2. Trigger background prefetch (fire-and-forget).
   *
   * @performance Phase 2 runs async without blocking the UI.
   */
  const init = async () => {
    // Guard: Skip if already initialized
    if (technologies.value.length > 0) return;

    isTechLoading.value = true;

    try {
      // PHASE 1: Load technologies (blocking)
      const { data: techData } = await useFetch<string[]>(
        "/api/projects/techs"
      );
      if (techData.value) {
        technologies.value = techData.value;
      }

      // PHASE 2: Prefetch projects in background (non-blocking)
      prefetchAllProjects();
    } catch (e) {
      console.error("[ShowcaseStore] Failed to initialize:", e);
    } finally {
      isTechLoading.value = false;
    }
  };

  // =====================================================================
  // [SECTION] :: PREFETCH STRATEGY
  // =====================================================================

  /**
   * [ACTION] :: PREFETCH_ALL_PROJECTS
   * Background task that loads the complete project dataset.
   * Runs asynchronously without blocking the UI thread.
   *
   * @strategy Fire-and-forget. No await in caller.
   * @side_effect Populates `allProjectsCache` + preloads images.
   */
  const prefetchAllProjects = async () => {
    try {
      // Fetch all projects without technology filter
      const { data } = await useFetch<Project[]>("/api/projects", {
        query: {
          limit: 100, // Adjust based on dataset size
        },
      });

      if (data.value) {
        allProjectsCache.value = data.value;

        // Preload images into browser cache
        preloadImages(data.value);
      }
    } catch (e) {
      console.error("[ShowcaseStore] Prefetch failed:", e);
    }
  };

  /**
   * [UTIL] :: PRELOAD_IMAGES
   * Forces browser to cache project images by creating Image objects.
   * Images are fetched but not inserted into the DOM.
   * Tracks successfully loaded images to prevent spinner re-display.
   *
   * @param projectList - Projects whose images should be preloaded.
   * @performance Eliminates loading delays when switching technologies.
   */
  const preloadImages = (projectList: Project[]) => {
    projectList.forEach((project) => {
      if (project.img_url && !loadedImages.value.has(project.img_url)) {
        const img = new Image();
        img.src = project.img_url;

        // Mark as loaded when complete
        img.onload = () => {
          loadedImages.value.add(project.img_url!);
        };

        // Also mark if already cached (immediate load)
        if (img.complete) {
          loadedImages.value.add(project.img_url);
        }
      }
    });
  };

  /**
   * [UTIL] :: IS_IMAGE_LOADED
   * Checks if an image URL has been successfully loaded before.
   * Used by components to skip showing loading spinners.
   *
   * @param url - Image URL to check.
   * @returns True if image is in cache, false otherwise.
   */
  const isImageLoaded = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return loadedImages.value.has(url);
  };

  /**
   * [UTIL] :: MARK_IMAGE_LOADED
   * Manually mark an image URL as loaded.
   * Called by components after successful image load.
   *
   * @param url - Image URL to mark as loaded.
   */
  const markImageLoaded = (url: string) => {
    loadedImages.value.add(url);
  };

  // =====================================================================
  // [SECTION] :: NAVIGATION ACTIONS
  // =====================================================================

  /**
   * [ACTION] :: SELECT_TECH
   * Selects a technology and updates the visible project list.
   * Uses local filtering for instant response (no API call).
   *
   * @param tech - Technology identifier to filter by.
   * @performance O(n) filter on cached data = ~instant.
   */
  const selectTech = async (tech: string) => {
    activeTech.value = tech;

    // Auto-switch to sidebar view if needed
    if (viewMode.value === "hero") {
      viewMode.value = "sidebar";
    }

    // Filter locally from cache
    filterProjectsLocally(tech);
  };

  /**
   * [ACTION] :: FILTER_PROJECTS_LOCALLY
   * Filters the cached project dataset by technology.
   * Falls back to API fetch if cache is empty (edge case: user is very fast).
   *
   * @param tech - Technology to filter by.
   * @fallback Calls `fetchProjects` if cache unavailable.
   */
  const filterProjectsLocally = (tech: string) => {
    isProjectsLoading.value = true;

    // EDGE CASE: Cache not ready yet (user was extremely fast)
    if (allProjectsCache.value.length === 0) {
      console.warn("[ShowcaseStore] Cache empty, falling back to API");
      fetchProjects(tech);
      return;
    }

    // Filter cached projects (instant)
    projects.value = allProjectsCache.value.filter(
      (p) => p.tech_stack?.includes(tech) || p.primary_tech === tech
    );

    isProjectsLoading.value = false;
  };

  /**
   * [ACTION] :: SET_VIEW_MODE
   * Manually switches between hero and sidebar layouts.
   *
   * @param mode - Target view mode.
   */
  const setViewMode = (mode: "hero" | "sidebar") => {
    viewMode.value = mode;
  };

  // =====================================================================
  // [SECTION] :: FALLBACK FETCH
  // =====================================================================

  /**
   * [ACTION] :: FETCH_PROJECTS (Fallback)
   * Direct API fetch for projects by technology.
   * Used as fallback when cache is unavailable or for forced refreshes.
   *
   * @param tech - Technology to fetch projects for.
   * @deprecated Primary flow uses local filtering.
   */
  const fetchProjects = async (tech: string) => {
    isProjectsLoading.value = true;

    try {
      const { data } = await useFetch<Project[]>("/api/projects", {
        query: {
          primary_tech: tech,
          limit: 50,
        },
      });

      if (data.value) {
        projects.value = data.value;
      } else {
        projects.value = [];
      }
    } catch (e) {
      console.error(`[ShowcaseStore] Failed to fetch projects for ${tech}:`, e);
      projects.value = [];
    } finally {
      isProjectsLoading.value = false;
    }
  };

  // =====================================================================
  // [SECTION] :: EXPORTS
  // =====================================================================

  return {
    // State (Read-only for components)
    technologies,
    projects,
    activeTech,
    viewMode,
    isTechLoading,
    isProjectsLoading,

    // Actions (Public API)
    init,
    selectTech,
    setViewMode,

    // Image tracking utilities
    isImageLoaded,
    markImageLoaded,
  };
});
