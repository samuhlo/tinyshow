/**
 * [API] :: GET_TECHS
 * ----------------------------------------------------------------------
 * Endpoint auxiliar para obtener la lista de tecnologías principales.
 * Útil para poblar menús de filtrado en el frontend.
 *
 * @module    server/api/projects
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { prisma } from "../../utils/prisma";

// =====================================================================
// [SECTION] :: ENDPOINT HANDLER
// =====================================================================

const CACHE_MAX_AGE = 60 * 60; // 1 hour
const NO_CACHE = 0;
const HTTP_INTERNAL_ERROR = 500;

export default defineCachedEventHandler(
  async (event) => {
    try {
      // Group by primary_tech to get unique values efficiently
      const groups = await prisma.project.groupBy({
        by: ["primary_tech"],
        _count: {
          primary_tech: true,
        },
        orderBy: {
          primary_tech: "asc",
        },
      });

      // Extract just the strings
      return groups.map((g) => g.primary_tech);
    } catch (error: any) {
      console.error("[API] :: projects/techs :: Error fetching techs", error);
      throw createError({
        statusCode: HTTP_INTERNAL_ERROR,
        statusMessage: "Internal Server Error",
        message: error.message,
      });
    }
  },
  {
    maxAge: import.meta.dev ? NO_CACHE : CACHE_MAX_AGE, // 1 hour in prod, 0 in dev
    swr: !import.meta.dev, // Disable SWR in dev
    name: "projects-techs",
    getKey: () => "techs",
  }
);
