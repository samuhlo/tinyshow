/**
 * [STORE] :: SHOWCASE_STORE
 * ----------------------------------------------------------------------
 * Fixed & Optimized for Background Prefetching
 * ----------------------------------------------------------------------
 * Implements a PREFETCH STRATEGY for optimal performance:
 * - Technologies are loaded on init (blocking).
 * - All projects are prefetched in background (non-blocking, client-only).
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
   * "La nevera llena" - Source of truth for all project data.
   */
  const allProjectsCache = ref<Project[]>([]);

  /**
   * [STATE] :: PROJECTS (Reactive Filtered View)
   * "Lo que servimos en la mesa" - Currently visible projects.
   * Filtered by active technology.
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
   * 2. Trigger background prefetch (fire-and-forget, client-only).
   *
   * @performance Phase 2 runs async without blocking the UI.
   */
  const init = async () => {
    isTechLoading.value = true;

    try {
      // PHASE 1: Load technologies (only if not already loaded)
      if (technologies.value.length === 0) {
        // useFetch is fine here because we need reactivity and context
        const { data } = await useFetch<string[]>("/api/projects/techs");
        if (data.value) {
          technologies.value = data.value;
        }
      }

      // PHASE 2: Prefetch projects in background (non-blocking)
      // CRITICAL: Only run on CLIENT to avoid SSR issues
      // Server's job is to deliver fast HTML, not to prefetch future data
      // ALSO check if cache is empty - this handles case where SSR loaded techs
      // but client needs to still prefetch projects
      if (import.meta.client && allProjectsCache.value.length === 0) {
        prefetchAllProjects();
      }
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
   * Uses $fetch (pure data, no Vue context needed).
   *
   * @strategy Fire-and-forget. No await in caller.
   * @side_effect Populates `allProjectsCache` + preloads images.
   */
  const prefetchAllProjects = async () => {
    try {
      // CRITICAL: Use $fetch, not useFetch
      // $fetch returns raw data, doesn't need Vue context
      const data = await $fetch<Project[]>("/api/projects", {
        query: { limit: 100 },
      });

      if (data) {
        allProjectsCache.value = data;

        // Preload images into browser cache
        // Safe to call here since we're already inside import.meta.client check
        preloadImages(data);
      }
    } catch (e) {
      // Silent fail - don't interrupt user experience
      console.warn("[ShowcaseStore] Background prefetch failed:", e);
    }
  };

  /**
   * [UTIL] :: PRELOAD_IMAGES
   * Forces browser to cache project images by creating Image objects.
   * Only runs on client side (Image API not available on server).
   *
   * @param projectList - Projects whose images should be preloaded.
   * @performance Eliminates loading delays when switching technologies.
   */
  const preloadImages = (projectList: Project[]) => {
    // Double-check we're on client (defensive programming)
    if (!import.meta.client) return;

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
   * Selects a technology and filters projects.
   * Uses cache if available for instant navigation.
   *
   * @param tech - Technology identifier to filter by.
   * @performance Instant if cache is ready, fallback to API if not.
   */
  const selectTech = async (tech: string) => {
    activeTech.value = tech;

    // Auto-switch to sidebar view
    if (viewMode.value === "hero") {
      viewMode.value = "sidebar";
    }

    // Strategy: Use cache if available (instant), fetch if not
    if (allProjectsCache.value.length > 0) {
      // Filter from cache - instant navigation
      projects.value = allProjectsCache.value.filter(
        (p) => p.tech_stack?.includes(tech) || p.primary_tech === tech
      );
    } else {
      // Fallback: User clicked before prefetch finished
      await fetchProjects(tech);
    }
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
   * Used when user is faster than background prefetch.
   *
   * @param tech - Technology to fetch projects for.
   */
  const fetchProjects = async (tech: string) => {
    isProjectsLoading.value = true;

    try {
      // Use $fetch instead of useFetch - can be called after component mount
      const data = await $fetch<Project[]>("/api/projects", {
        query: {
          primary_tech: tech,
          limit: 50,
        },
      });

      if (data) {
        projects.value = data;
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
