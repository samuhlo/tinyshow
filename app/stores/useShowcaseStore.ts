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

// =====================================================================
// [SECTION] :: CONSTANTS
// =====================================================================

/** TTL de caché en milisegundos (30 minutos) */
const CACHE_TTL_MS = 30 * 60 * 1000;

export const useShowcaseStore = defineStore("showcase", () => {
  // =====================================================================
  // [SECTION] :: STATE
  // =====================================================================

  /**
   * [STATE] :: TECHNOLOGIES
   * Tecnologías disponibles para el menú principal.
   * Cargado una vez al inicializar el store.
   */
  const technologies = ref<string[]>([]);

  /**
   * [STATE] :: ALL_PROJECTS_CACHE
   * Dataset completo de proyectos precargado en segundo plano.
   * "La nevera llena" - Fuente de verdad para todos los datos de proyectos.
   */
  const allProjectsCache = ref<Project[]>([]);

  /**
   * [STATE] :: PROJECTS (Reactive Filtered View)
   * "Lo que servimos en la mesa" - Proyectos visibles actualmente.
   * Filtrado por tecnología activa.
   */
  const projects = ref<Project[]>([]);

  /**
   * [STATE] :: ACTIVE_TECH
   * Filtro de tecnología seleccionado actualmente.
   */
  const activeTech = ref<string | null>(null);

  /**
   * [STATE] :: VIEW_MODE
   * Modo de diseño actual: 'hero' (landing) o 'sidebar' (navegación).
   */
  const viewMode = ref<"hero" | "sidebar">("hero");

  /**
   * [STATE] :: LOADING_FLAGS
   * Rastrea operaciones asíncronas para feedback de UI.
   */
  const isTechLoading = ref(false);
  const isProjectsLoading = ref(false);

  /**
   * [STATE] :: LOADED_IMAGES
   * Rastrea qué URLs de imagen han sido cargadas exitosamente.
   * Previene mostrar spinner para imágenes ya en caché del navegador.
   */
  const loadedImages = ref<Set<string>>(new Set());

  /**
   * [STATE] :: LAST_FETCH_TIMESTAMP
   * Timestamp del último fetch de datos exitoso.
   * Usado para validar TTL de caché.
   */
  const lastFetchTimestamp = ref<number | null>(null);

  // =====================================================================
  // [SECTION] :: CACHE VALIDATION
  // =====================================================================

  /**
   * [UTIL] :: IS_CACHE_VALID
   * Comprueba si los datos en caché siguen siendo válidos según el TTL.
   *
   * @returns Verdadero si la caché es válida y existen datos, falso en c.c.
   */
  const isCacheValid = (): boolean => {
    // Sin timestamp = nunca obtenido
    if (!lastFetchTimestamp.value) return false;

    // Sin datos = caché vacía
    if (technologies.value.length === 0) return false;

    // Verificar si TTL ha expirado
    const elapsed = Date.now() - lastFetchTimestamp.value;
    return elapsed < CACHE_TTL_MS;
  };

  // =====================================================================
  // [SECTION] :: INITIALIZATION
  // =====================================================================

  /**
   * [ACTION] :: INIT
   * Inicializa el store con una estrategia de carga en dos fases:
   * 1. Esperar tecnologías (requerido para render UI).
   * 2. Disparar prefetch en segundo plano (fire-and-forget, solo cliente).
   *
   * @performance La Fase 2 corre asíncronamente sin bloquear la UI.
   */
  const init = async () => {
    // RUTA RÁPIDA: Omitir fetch si caché sigue válida
    if (isCacheValid()) {
      console.log("[ShowcaseStore] Cache valid, skipping fetch");
      return;
    }

    isTechLoading.value = true;

    try {
      // FASE 1: Cargar tecnologías
      // useFetch está bien aquí porque necesitamos reactividad y contexto
      const { data } = await useFetch<string[]>("/api/projects/techs");
      if (data.value) {
        technologies.value = data.value;
        // Actualizar timestamp al obtener fetch exitoso
        lastFetchTimestamp.value = Date.now();
      }

      // FASE 2: Projectos prefetch en segundo plano (no bloqueante)
      // CRÍTICO: Solo ejecutar en CLIENTE para evitar problemas SSR
      // El trabajo del servidor es entregar HTML rápido, no precargar datos futuros
      // TAMBIÉN verificar si caché está vacía - maneja caso donde SSR cargó techs
      // pero cliente necesita prefetch proyectos
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
   * Tarea en segundo plano que carga el dataset completo de proyectos.
   * Usa $fetch (datos puros, sin necesidad de contexto Vue).
   *
   * @strategy Fire-and-forget. Sin await en el invocador.
   * @side_effect Puebla `allProjectsCache` + precarga imágenes.
   */
  const prefetchAllProjects = async () => {
    try {
      // CRÍTICO: Usar $fetch, no useFetch
      // $fetch devuelve datos crudos, no necesita contexto Vue
      const data = await $fetch<Project[]>("/api/projects", {
        query: { limit: 100 },
      });

      if (data) {
        allProjectsCache.value = data;

        // Precargar imágenes en caché del navegador
        // Seguro de llamar aquí ya que estamos dentro de import.meta.client check
        preloadImages(data);
      }
    } catch (e) {
      // Fallo silencioso - no interrumpir experiencia de usuario
      console.warn("[ShowcaseStore] Background prefetch failed:", e);
    }
  };

  /**
   * [UTIL] :: PRELOAD_IMAGES
   * Fuerza al navegador a cachear imágenes de proyecto creando objetos Image.
   * Solo corre en cliente (API Image no disponible en servidor).
   *
   * @param projectList - Proyectos cuyas imágenes deben ser precargadas.
   * @performance Elimina retrasos de carga al cambiar tecnologías.
   */
  const preloadImages = (projectList: Project[]) => {
    // Doble verificación de que estamos en cliente (programación defensiva)
    if (!import.meta.client) return;

    projectList.forEach((project) => {
      if (project.img_url && !loadedImages.value.has(project.img_url)) {
        const img = new Image();
        img.src = project.img_url;

        // Marcar como cargado al completar
        img.onload = () => {
          loadedImages.value.add(project.img_url!);
        };

        // También marcar si ya está en caché (carga inmediata)
        if (img.complete) {
          loadedImages.value.add(project.img_url);
        }
      }
    });
  };

  /**
   * [UTIL] :: IS_IMAGE_LOADED
   * Comprueba si una URL de imagen ha sido cargada exitosamente antes.
   * Usado por componentes para saltar mostrar spinners de carga.
   *
   * @param url - URL de imagen a comprobar.
   * @returns Verdadero si imagen está en caché, falso en c.c.
   */
  const isImageLoaded = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return loadedImages.value.has(url);
  };

  /**
   * [UTIL] :: MARK_IMAGE_LOADED
   * Marca manualmente una URL de imagen como cargada.
   * Llamado por componentes tras carga exitosa de imagen.
   *
   * @param url - URL de imagen a marcar como cargada.
   */
  const markImageLoaded = (url: string) => {
    loadedImages.value.add(url);
  };

  // =====================================================================
  // [SECTION] :: NAVIGATION ACTIONS
  // =====================================================================

  /**
   * [ACTION] :: SELECT_TECH
   * Selecciona una tecnología y filtra proyectos.
   * Usa caché si está disponible para navegación instantánea.
   *
   * @param tech - Identificador de tecnología a filtrar.
   * @performance Instantáneo si caché está lista, fallback a API si no.
   */
  const selectTech = async (tech: string) => {
    activeTech.value = tech;

    // Cambio automático a vista sidebar
    if (viewMode.value === "hero") {
      viewMode.value = "sidebar";
    }

    // Estrategia: Usar caché si está disponible (instantaneo), fetch si no
    if (allProjectsCache.value.length > 0) {
      // Filtrar desde caché - navegación instantánea
      projects.value = allProjectsCache.value.filter(
        (p) => p.primary_tech === tech
      );
    } else {
      // Fallback: Usuario hizo click antes de terminar prefetch,
      await fetchProjects(tech);
    }
  };

  /**
   * [ACTION] :: SET_VIEW_MODE
   * Cambia manualmente entre diseños hero y sidebar.
   *
   * @param mode - Modo de vista objetivo.
   */
  const setViewMode = (mode: "hero" | "sidebar") => {
    viewMode.value = mode;
  };

  // =====================================================================
  // [SECTION] :: FALLBACK FETCH
  // =====================================================================

  /**
   * [ACTION] :: FETCH_PROJECTS (Fallback)
   * Fetch directo a API para proyectos por tecnología.
   * Usado cuando el usuario es más rápido que el prefetch en segundo plano.
   *
   * @param tech - Tecnología para la que buscar proyectos.
   */
  const fetchProjects = async (tech: string) => {
    isProjectsLoading.value = true;

    try {
      // Usar $fetch en lugar de useFetch - se puede llamar tras montar componente
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
  // [SECTION] :: CACHE INVALIDATION
  // =====================================================================

  /**
   * [ACTION] :: INVALIDATE_CACHE
   * Fuerza la invalidación de caché. Usado cuando ocurren actualizaciones por webhook.
   * La siguiente llamada a init() obtendrá datos frescos.
   */
  const invalidateCache = () => {
    lastFetchTimestamp.value = null;
    technologies.value = [];
    allProjectsCache.value = [];
    projects.value = [];
    console.log("[ShowcaseStore] Cache invalidated");
  };

  // =====================================================================
  // [SECTION] :: EXPORTS
  // =====================================================================

  return {
    // Estado (Solo lectura para componentes)
    technologies,
    projects,
    activeTech,
    viewMode,
    isTechLoading,
    isProjectsLoading,

    // Acciones (API pública)
    init,
    selectTech,
    setViewMode,
    invalidateCache,

    // Utilidades de rastreo de imágenes
    isImageLoaded,
    markImageLoaded,
  };
});
