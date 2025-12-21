/**
 * [UTIL] :: CACHE_UTILS
 * ----------------------------------------------------------------------
 * Utilidades para gestión de caché en Nitro/Vercel.
 * Proporciona funciones centralizadas para invalidación de caché.
 *
 * @module    server/utils/cache
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

// =====================================================================
// [SECTION] :: CACHE KEYS
// =====================================================================

/**
 * Prefijos de caché conocidos para los handlers cacheados.
 * Deben coincidir con los nombres definidos en los handlers.
 */
const CACHE_PREFIXES = [
  "nitro:handlers:projects-list",
  "nitro:handlers:projects-techs",
  "nitro:handlers:project-detail",
];

// =====================================================================
// [SECTION] :: INVALIDATION
// =====================================================================

/**
 * [CACHE] :: INVALIDATE_ALL_PROJECT_CACHES
 * Elimina todas las entradas de caché relacionadas con proyectos.
 *
 * Funciona tanto en desarrollo como en producción (Vercel).
 *
 * @returns Número de claves eliminadas.
 */
export async function invalidateAllProjectCaches(): Promise<number> {
  const storage = useStorage("cache");
  let deletedCount = 0;

  try {
    // Get ALL keys from cache storage
    const allKeys = await storage.getKeys();

    console.log(`[CACHE] :: SCANNING      :: total keys: ${allKeys.length}`);

    // Filter keys that match our project-related caches
    const projectKeys = allKeys.filter(
      (key) =>
        CACHE_PREFIXES.some((prefix) => key.includes(prefix)) ||
        key.includes("projects:") ||
        key.includes("_projects")
    );

    // Delete each matching key
    for (const key of projectKeys) {
      await storage.removeItem(key);
      deletedCount++;
    }

    if (deletedCount > 0) {
      console.log(
        `[CACHE] >> INVALIDATED   :: count: ${deletedCount} | keys: ${projectKeys
          .slice(0, 5)
          .join(", ")}${projectKeys.length > 5 ? "..." : ""}`
      );
    } else {
      console.log(`[CACHE] :: NO_KEYS       :: Nothing to invalidate`);
    }

    return deletedCount;
  } catch (err) {
    console.error("[CACHE] :: ERROR         :: Failed to clear cache", err);
    return 0;
  }
}
