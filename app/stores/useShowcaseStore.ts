/**
 * [STORE] :: SHOWCASE_STORE
 * ----------------------------------------------------------------------
 * Core store for the showcase domain.
 * Manages technologies, projects, and the main navigation state (Hero vs Sidebar).
 *
 * @module    stores/showcase
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import type { Project } from "~~/shared/types";

export const useShowcaseStore = defineStore("showcase", () => {
  // [STATE]
  const technologies = ref<string[]>([]);
  const projects = ref<Project[]>([]);

  // Navigation State
  const activeTech = ref<string | null>(null);
  const viewMode = ref<"hero" | "sidebar">("hero");

  // Loading States
  const isTechLoading = ref(false);
  const isProjectsLoading = ref(false);

  // [ACTIONS]

  /**
   * Initializes the store by fetching available technologies.
   */
  const init = async () => {
    if (technologies.value.length > 0) return;

    isTechLoading.value = true;
    try {
      const { data, error } = await useFetch<string[]>("/api/projects/techs");
      if (data.value) {
        technologies.value = data.value;
      }
    } catch (e) {
      console.error("Failed to fetch technologies", e);
    } finally {
      isTechLoading.value = false;
    }
  };

  /**
   * Sets the active technology and fetches associated projects.
   * Automatically switches view mode to 'sidebar' if currently in 'hero'.
   */
  const selectTech = async (tech: string) => {
    activeTech.value = tech;

    if (viewMode.value === "hero") {
      viewMode.value = "sidebar";
    }

    await fetchProjects(tech);
  };

  const setViewMode = (mode: "hero" | "sidebar") => {
    viewMode.value = mode;
  };

  /**
   * Fetches projects for the given technology.
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
      console.error(`Failed to fetch projects for ${tech}`, e);
      projects.value = [];
    } finally {
      isProjectsLoading.value = false;
    }
  };

  return {
    // State
    technologies,
    projects,
    activeTech,
    viewMode,
    isTechLoading,
    isProjectsLoading,

    // Actions
    init,
    selectTech,
    setViewMode,
    fetchProjects,
  };
});
