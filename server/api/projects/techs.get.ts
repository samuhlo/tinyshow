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
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: error.message,
      });
    }
  },
  {
    maxAge: import.meta.dev ? 0 : 60 * 60, // 1 hour in prod, 0 in dev
    swr: !import.meta.dev, // Disable SWR in dev
    name: "projects-techs",
    getKey: () => "techs",
  }
);
